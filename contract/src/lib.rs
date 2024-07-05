#![cfg_attr(not(feature = "std"), no_std)]

use concordium_std::*;
use core::fmt::Debug;

#[derive(Clone, Serialize, SchemaType)]
struct Proposal {
    description: String,
    amount: Amount,
    votes_for: u64,
    votes_against: u64,
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
    members.push(ctx.init_origin());
    Ok(DAOState {
        proposals: vec![],
        votes: vec![],
        members,
    })
}

#[derive(Serialize, SchemaType)]
struct DAOState {
    proposals: Vec<Proposal>,
    votes: Vec<(u64, AccountAddress)>, // (proposal_id, voter_address)
    members: Vec<AccountAddress>,
}

#[receive(
    contract = "DAO",
    name = "receive",
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
    state.proposals.push(Proposal {
        description: input.clone().description,
        amount: input.clone().amount,
        votes_for: 0,
        votes_against: 0,
    });

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

    let proposal = state
        .proposals
        .get_mut(proposal_id as usize)
        .ok_or(Error::ProposalNotFound)?;
    if vote_for {
        proposal.votes_for += 1;
    } else {
        proposal.votes_against += 1;
    }
    state.votes.push((proposal_id, sender));

    logger.log(&DAOEvent::Voted {
        proposal_id,
        votes_for: proposal.votes_for,
        votes_against: proposal.votes_against,
    })?;

    Ok(())
}
