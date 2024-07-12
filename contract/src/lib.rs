#![cfg_attr(not(feature = "std"), no_std)]

use concordium_std::*;
use core::fmt::Debug;

#[derive(Serialize, SchemaType)]
pub struct DAOState {
    pub proposals: Vec<(u64, Proposal)>,
    pub votes: Vec<(u64, AccountAddress)>, // (proposal_id, voter_address)
    pub members: Vec<AccountAddress>,
    pub admin: AccountAddress,
}

#[derive(Debug, Clone, Serialize, SchemaType, PartialEq, Eq)]
pub struct Proposal {
    pub proposer: AccountAddress,
    pub description: String,
    pub amount: Amount,
    pub votes_for: u64,
    pub votes_against: u64,
    pub status: Status,
}

#[derive(Debug, Clone, Serialize, SchemaType, PartialEq, Eq)]
pub enum Status {
    Active,
    Approved,
    Denied,
    Collected,
}

#[derive(Clone, Serialize, SchemaType)]
struct Member {
    address: AccountAddress,
}

#[derive(Clone, Serialize, SchemaType, Debug, PartialEq, Eq)]
pub struct ProposalInput {
    pub description: String,
    pub amount: Amount,
}

#[derive(Debug, Serialize, SchemaType, PartialEq, Eq)]
pub struct VoteInput {
    pub proposal_id: u64,
    pub vote_for: bool,
}

/// Your smart contract errors.
#[derive(Debug, PartialEq, Eq, Reject, Serialize, SchemaType)]
pub enum DAOError {
    /// Failed parsing the parameter.
    #[from(ParseError)]
    ParseParams,
    /// Your error
    Unauthorized,
    AlreadyAdded,
    ProposalNotFound,
    AlreadyVoted,
    NotApproved,
    ProposalDenied,
    InsufficientBalance,
    AmountCollected,
}

#[derive(Debug, Serialize, SchemaType, PartialEq, Eq)]
pub enum DAOEvent {
    ProposalCreated {
        proposal_id: u64,
        description: String,
        amount: Amount,
    },
    Voted {
        proposal_id: u64,
        votes_for: u64,
        votes_against: u64,
    },
    MemberAdded {
        address: AccountAddress,
    },
}

#[init(contract = "DAO")]
fn dao_init(ctx: &InitContext, _state_builder: &mut StateBuilder) -> InitResult<DAOState> {
    let mut members: Vec<AccountAddress> = vec![];
    let admin = ctx.init_origin();
    members.push(admin.clone());
    Ok(DAOState {
        proposals: vec![],
        votes: vec![],
        members,
        admin,
    })
}

#[receive(
    contract = "DAO",
    name = "create_proposal",
    parameter = "ProposalInput",
    error = "DAOError",
    mutable,
    enable_logger
)]
fn dao_create_proposal(
    ctx: &ReceiveContext,
    host: &mut Host<DAOState>,
    logger: &mut Logger,
) -> ReceiveResult<()> {
    let input: ProposalInput = ctx.parameter_cursor().get()?;
    let description = input.clone().description;
    let amount = input.clone().amount;
    let state = host.state_mut();
    let proposal_id = state.proposals.len() as u64;
    state.proposals.push((
        proposal_id,
        Proposal {
            proposer: ctx.invoker(),
            description: input.clone().description,
            amount: input.clone().amount,
            votes_for: 0,
            votes_against: 0,
            status: Status::Active,
        },
    ));

    logger.log(&DAOEvent::ProposalCreated {
        proposal_id,
        description,
        amount,
    })?;

    Ok(())
}

#[receive(
    contract = "DAO",
    name = "vote",
    parameter = "VoteInput",
    error = "DAOError",
    mutable,
    enable_logger
)]
fn dao_vote(
    ctx: &ReceiveContext,
    host: &mut Host<DAOState>,
    logger: &mut Logger,
) -> ReceiveResult<()> {
    let input: VoteInput = ctx.parameter_cursor().get()?;
    let state = host.state_mut();
    let sender = ctx.invoker();

    if state.members.iter().any(|addr| *addr != sender) {
        return Err(DAOError::Unauthorized.into());
    }

    if state
        .votes
        .iter()
        .any(|(id, addr)| *id == input.proposal_id && *addr == sender)
    {
        return Err(DAOError::AlreadyVoted.into());
    }

    let proposal_data = state
        .proposals
        .get_mut(input.proposal_id as usize)
        .ok_or(DAOError::ProposalNotFound)?;
    if input.vote_for {
        proposal_data.1.votes_for += 1;
    } else {
        proposal_data.1.votes_against += 1;
    }
    state.votes.push((input.proposal_id, sender));

    logger.log(&DAOEvent::Voted {
        proposal_id: input.proposal_id,
        votes_for: proposal_data.1.votes_for,
        votes_against: proposal_data.1.votes_against,
    })?;

    let total = state.members.len();

    if proposal_data.1.votes_for > (total / 2).try_into().unwrap() {
        proposal_data.1.status = Status::Approved
    } else if proposal_data.1.votes_against > (total / 2).try_into().unwrap() {
        proposal_data.1.status = Status::Denied
    }

    Ok(())
}

#[receive(
    contract = "DAO",
    name = "all_proposals",
    return_value = "Vec<(u64, Proposal)>",
    error = "DAOError"
)]
fn dao_all_proposals(
    _ctx: &ReceiveContext,
    host: &Host<DAOState>,
) -> ReceiveResult<Vec<(u64, Proposal)>> {
    Ok(host.state().proposals.clone())
}

#[receive(
    contract = "DAO",
    name = "all_members",
    return_value = "Vec<AccountAddress>",
    error = "DAOError"
)]
fn dao_all_members(
    _ctx: &ReceiveContext,
    host: &Host<DAOState>,
) -> ReceiveResult<Vec<AccountAddress>> {
    Ok(host.state().members.clone())
}

/// Insert some CCD into DAO, allowed by anyone.
#[receive(contract = "DAO", name = "insert", payable)]
fn dao_insert(_ctx: &ReceiveContext, _host: &Host<DAOState>, _amount: Amount) -> ReceiveResult<()> {
    Ok(())
}

#[receive(
    contract = "DAO",
    name = "add_member",
    parameter = "Member",
    mutable,
    enable_logger
)]
fn dao_add_member(
    ctx: &ReceiveContext,
    host: &mut Host<DAOState>,
    logger: &mut Logger,
) -> ReceiveResult<()> {
    let state = host.state_mut();
    if ctx.invoker() != state.admin {
        return Err(DAOError::Unauthorized.into());
    }
    let member: Member = ctx.parameter_cursor().get()?;

    if !state.members.contains(&member.address) {
        state.members.push(member.address);
    } else {
        return Err(DAOError::AlreadyAdded.into());
    }

    logger.log(&DAOEvent::MemberAdded {
        address: member.address,
    })?;

    Ok(())
}

#[receive(contract = "DAO", name = "withdraw")]
fn dao_withdraw(ctx: &ReceiveContext, host: &Host<DAOState>) -> ReceiveResult<()> {
    let proposal_id: u64 = ctx.parameter_cursor().get()?;
    let state = host.state();
    let caller = ctx.invoker();

    for (id, p) in &state.proposals {
        if *id == proposal_id && p.proposer == caller {
            if p.status == Status::Approved {
                if p.amount < host.self_balance() {
                    return Ok(host.invoke_transfer(&caller, p.amount)?);
                } else {
                    return Err(Error::InsufficientBalance.into());
                }
            } else if p.status == Status::Denied {
                return Err(Error::ProposalDenied.into());
            } else {
                return Err(Error::NotApproved.into());
            }
        } else {
            return Err(Error::Unauthorized.into());
        }
    }
    Ok(())
}
