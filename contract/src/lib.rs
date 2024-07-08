#![cfg_attr(not(feature = "std"), no_std)]

use concordium_std::*;
use core::fmt::Debug;

#[derive(Serialize, SchemaType)]
struct DAOState {
    proposals: Vec<(u64, Proposal)>,
    votes: Vec<(u64, AccountAddress)>, // (proposal_id, voter_address)
    members: Vec<AccountAddress>,
    admin: AccountAddress,
}

#[derive(Clone, Serialize, SchemaType)]
struct Proposal {
    proposer: AccountAddress,
    description: String,
    amount: Amount,
    votes_for: u64,
    votes_against: u64,
    status: Status,
}

#[derive(Clone, Serialize, SchemaType, PartialEq)]
pub enum Status {
    Active,
    Approved,
    Denied,
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

/// Your smart contract errors.
#[derive(Debug, PartialEq, Eq, Reject, Serialize, SchemaType)]
pub enum Error {
    /// Failed parsing the parameter.
    #[from(ParseError)]
    ParseParams,
    /// Your error
    ProposalNotFound,
    AlreadyVoted,
    Unauthorized,
}

#[derive(Serialize, SchemaType)]
enum DAOEvent {
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
    error = "Error",
    enable_logger,
    mutable
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

#[receive(contract = "DAO", name = "vote", mutable, enable_logger)]
fn dao_vote(
    ctx: &ReceiveContext,
    host: &mut Host<DAOState>,
    logger: &mut Logger,
) -> ReceiveResult<()> {
    let (proposal_id, vote_for): (u64, bool) = ctx.parameter_cursor().get()?;
    let state = host.state_mut();
    let sender = ctx.invoker();

    if state.members.iter().any(|addr| *addr != sender) {
        return Err(Error::Unauthorized.into());
    }

    if state
        .votes
        .iter()
        .any(|(id, addr)| *id == proposal_id && *addr == sender)
    {
        return Err(Error::AlreadyVoted.into());
    }

    let proposal_data = state
        .proposals
        .get_mut(proposal_id as usize)
        .ok_or(Error::ProposalNotFound)?;
    if vote_for {
        proposal_data.1.votes_for += 1;
    } else {
        proposal_data.1.votes_against += 1;
    }
    state.votes.push((proposal_id, sender));

    logger.log(&DAOEvent::Voted {
        proposal_id,
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

#[receive(contract = "DAO", name = "all_proposals", return_value = "DAOState")]
fn dao_all_proposals(
    _ctx: &ReceiveContext,
    host: &Host<DAOState>,
) -> ReceiveResult<Vec<(u64, Proposal)>> {
    let proposals = host.state().proposals.clone();
    Ok(proposals)
}

/// Insert some CCD into DAO, allowed by anyone.
#[receive(contract = "DAO", name = "insert", payable)]
fn dao_insert(_ctx: &ReceiveContext, _host: &Host<DAOState>, _amount: Amount) -> ReceiveResult<()> {
    Ok(())
}

#[receive(contract = "DAO", name = "add_member", parameter = "Member", mutable)]
fn dao_add_member(ctx: &ReceiveContext, host: &mut Host<DAOState>) -> ReceiveResult<()> {
    let state = host.state_mut();
    if ctx.invoker() != state.admin {
        return Err(Error::Unauthorized.into());
    }
    let member: Member = ctx.parameter_cursor().get()?;
    state.members.push(member.address);
    Ok(())
}
