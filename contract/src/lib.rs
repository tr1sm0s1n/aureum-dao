#![cfg_attr(not(feature = "std"), no_std)]

use concordium_std::*;
use core::fmt::Debug;

#[derive(Serialize, SchemaType)]
pub struct DAOState {
    pub proposals: Vec<(u64, Proposal)>,
    pub members: Vec<(AccountAddress, u64)>,
    pub origin: AccountAddress,
}

#[derive(Debug, Clone, Serialize, SchemaType, PartialEq, Eq)]
pub struct Proposal {
    pub proposer: AccountAddress,
    pub description: String,
    pub amount: Amount,
    pub votes: u64,
    pub voters: Vec<(AccountAddress, u64)>,
    pub status: Status,
}

#[derive(Debug, Clone, Serialize, SchemaType, PartialEq, Eq)]
pub enum Status {
    Active,
    Approved,
    Collected,
}

#[derive(Clone, Serialize, SchemaType, Debug, PartialEq, Eq)]
pub struct ProposalInput {
    pub description: String,
    pub amount: Amount,
}

#[derive(Debug, Serialize, SchemaType, PartialEq, Eq)]
pub struct VoteInput {
    pub proposal_id: u64,
    pub votes: u64,
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
    NotApproved,
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
        voter: AccountAddress,
        total_votes: u64,
    },
}

#[init(contract = "DAO")]
fn dao_init(ctx: &InitContext, _state_builder: &mut StateBuilder) -> InitResult<DAOState> {
    let origin = ctx.init_origin();
    Ok(DAOState {
        proposals: vec![],
        members: vec![],
        origin,
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
            votes: 0,
            voters: vec![],
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
    let voter = ctx.invoker();

    if state.members.is_empty()
        || state
            .members
            .iter()
            .any(|m| m.0 != voter || m.1 == 0 || m.1 < input.votes)
    {
        return Err(DAOError::Unauthorized.into());
    }

    let proposal_data = state
        .proposals
        .get_mut(input.proposal_id as usize)
        .ok_or(DAOError::ProposalNotFound)?;

    proposal_data.1.votes += input.votes;
    for (v, votes) in proposal_data.1.voters.iter_mut() {
        if *v == voter {
            *votes += input.votes;
        }
    }

    proposal_data.1.voters.push((voter, input.votes));

    logger.log(&DAOEvent::Voted {
        proposal_id: input.proposal_id,
        voter,
        total_votes: proposal_data.1.votes,
    })?;

    for (account, power) in state.members.iter_mut() {
        if *account == voter {
            *power -= input.votes;
        }
    }

    if proposal_data.1.votes >= proposal_data.1.amount.micro_ccd() {
        proposal_data.1.status = Status::Approved
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
    return_value = "Vec<(AccountAddress,u64)>",
    error = "DAOError"
)]
fn dao_all_members(
    _ctx: &ReceiveContext,
    host: &Host<DAOState>,
) -> ReceiveResult<Vec<(AccountAddress, u64)>> {
    Ok(host.state().members.clone())
}

/// Insert some CCD into DAO, allowed by anyone.
#[receive(contract = "DAO", name = "insert", mutable, payable)]
fn dao_insert(
    ctx: &ReceiveContext,
    host: &mut Host<DAOState>,
    amount: Amount,
) -> ReceiveResult<()> {
    let invoker = ctx.invoker();
    let micro_ccd_amount = amount.micro_ccd();
    let members = &mut host.state_mut().members;

    // Check if the invoker already exists in the members vector.
    for (account, power) in members.iter_mut() {
        if *account == invoker {
            *power += micro_ccd_amount;
            return Ok(());
        }
    }

    // If the invoker is not found, add a new entry.
    members.push((invoker, micro_ccd_amount));
    Ok(())
}

#[receive(contract = "DAO", name = "withdraw", parameter = "u64", mutable)]
fn dao_withdraw(ctx: &ReceiveContext, host: &mut Host<DAOState>) -> ReceiveResult<()> {
    let proposal_id: u64 = ctx.parameter_cursor().get()?;
    let caller = ctx.invoker();

    // Extract necessary information without borrowing state
    let (proposal_status, proposal_amount) = {
        let state = host.state();
        let mut found_proposal = None;

        for (id, p) in &state.proposals {
            if *id == proposal_id && p.proposer == caller {
                found_proposal = Some((p.status.clone(), p.amount));
                break;
            }
        }

        found_proposal.ok_or(DAOError::Unauthorized)?
    };

    // Perform checks
    match proposal_status {
        Status::Approved => {
            if proposal_amount > host.self_balance() {
                return Err(DAOError::InsufficientBalance.into());
            }
        }
        Status::Collected => return Err(DAOError::AmountCollected.into()),
        _ => return Err(DAOError::NotApproved.into()),
    }

    // Perform mutable operation
    let state = host.state_mut();
    for (id, p) in &mut state.proposals {
        if *id == proposal_id {
            // Perform the transfer
            p.status = Status::Collected;
            return Ok(host.invoke_transfer(&caller, proposal_amount)?);
        }
    }

    Ok(())
}
