#![cfg_attr(not(feature = "std"), no_std)]

use concordium_std::*;
use core::fmt::Debug;

/// The state of the contract.
#[derive(Serialize, SchemaType)]
pub struct DAOState {
    pub proposals: Vec<(u64, Proposal)>,
    pub members: Vec<(AccountAddress, u64)>,
    pub origin: AccountAddress,
}

/// Can be proposed by anyone, membership in the DAO is not mandatory.
#[derive(Debug, Clone, Serialize, SchemaType, PartialEq, Eq)]
pub struct Proposal {
    /// The one who has proposed the charity.
    pub proposer: AccountAddress,
    /// Description regarding the charity.
    pub description: String,
    /// Threshold amount required for the charity.
    pub amount: Amount,
    /// Votes attained by the proposal.
    pub votes: u64,
    /// Those who have voted for the charity.
    pub contributers: Vec<(AccountAddress, u64)>,
    pub status: Status,
}

/// Status of a proposal.
#[derive(Debug, Clone, Serialize, SchemaType, PartialEq, Eq)]
pub enum Status {
    Active,
    Approved,
    Collected,
}

/// Input for [`DAO.create_proposal`].
#[derive(Clone, Serialize, SchemaType, Debug, PartialEq, Eq)]
pub struct ProposalInput {
    pub description: String,
    pub amount: Amount,
}

/// Input for [`DAO.vote`].
#[derive(Debug, Serialize, SchemaType, PartialEq, Eq)]
pub struct VoteInput {
    pub proposal_id: u64,
    pub votes: u64,
}

/// Input for [`DAO.withdraw`].
#[derive(Debug, Serialize, SchemaType, PartialEq, Eq)]
pub struct WithdrawInput {
    pub proposal_id: u64,
}

/// Input for [`DAO.get_power`].
#[derive(Debug, Serialize, SchemaType, PartialEq, Eq)]
pub struct AddressInput {
    pub address: AccountAddress,
}

///  Smart contract errors.
#[derive(Debug, PartialEq, Eq, Reject, Serialize, SchemaType)]
pub enum DAOError {
    /// Failed parsing the parameter.
    #[from(ParseError)]
    ParseParams,
    Unauthorized,
    ProposalNotFound,
    NotApproved,
    AlreadyApproved,
    InsufficientBalance,
    AmountCollected,
}

/// Events emitted from DAO contract.
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
    Renounced {
        proposal_id: u64,
        voter: AccountAddress,
        total_votes: u64,
    },
}

/// Initialize the contract with empty proposals and members.
#[init(contract = "DAO")]
fn dao_init(ctx: &InitContext, _state_builder: &mut StateBuilder) -> InitResult<DAOState> {
    let origin = ctx.init_origin();
    Ok(DAOState {
        proposals: vec![],
        members: vec![],
        origin,
    })
}

/// Function to create a proposal; can be invoked by anyone.
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
            contributers: vec![],
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

/// Function to vote on a proposal; can only be invoked by members.
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

    // Checking whether the invoker has enough power to vote.
    if state.members.is_empty()
        || !state
            .members
            .iter()
            .any(|m| m.0 == voter && m.1 > 0 && m.1 >= input.votes)
    {
        return Err(DAOError::Unauthorized.into());
    }

    let proposal_data = state
        .proposals
        .get_mut(input.proposal_id as usize)
        .ok_or(DAOError::ProposalNotFound)?;

    proposal_data.1.votes += input.votes;
    let mut exists = false;

    // Checking whether the invoker has voted already.
    for (v, votes) in proposal_data.1.contributers.iter_mut() {
        if *v == voter {
            // Incrementing the votes if already voted.
            *votes += input.votes;
            exists = true;
            break;
        }
    }

    if !exists {
        proposal_data.1.contributers.push((voter, input.votes));
    }

    logger.log(&DAOEvent::Voted {
        proposal_id: input.proposal_id,
        voter,
        total_votes: proposal_data.1.votes,
    })?;

    // Decrementing the voting power of the voter.
    for (account, power) in state.members.iter_mut() {
        if *account == voter {
            *power -= input.votes;
        }
    }

    // Checking whether the threshold has reached.
    if proposal_data.1.votes >= proposal_data.1.amount.micro_ccd() {
        // Approve the proposal if threshold has reached.
        proposal_data.1.status = Status::Approved
    }

    Ok(())
}

/// Function to renounce votes on a proposal; can only be invoked by contributers (voters).
#[receive(
    contract = "DAO",
    name = "renounce",
    parameter = "VoteInput",
    error = "DAOError",
    mutable,
    enable_logger
)]
fn dao_renounce(
    ctx: &ReceiveContext,
    host: &mut Host<DAOState>,
    logger: &mut Logger,
) -> ReceiveResult<()> {
    let input: VoteInput = ctx.parameter_cursor().get()?;
    let state = host.state_mut();
    let voter = ctx.invoker();
    let mut renounce = 0;

    // Checking whether the invoker is a member.
    if state.members.is_empty() || !state.members.iter().any(|m| m.0 == voter) {
        return Err(DAOError::Unauthorized.into());
    }

    let proposal_data = state
        .proposals
        .get_mut(input.proposal_id as usize)
        .ok_or(DAOError::ProposalNotFound)?;

    // Can't renounce if the proposal is approved.
    if proposal_data.1.status == Status::Approved || proposal_data.1.status == Status::Collected {
        return Err(DAOError::AlreadyApproved.into());
    }

    for (v, votes) in proposal_data.1.contributers.iter_mut() {
        if *v == voter {
            if *votes > input.votes {
                // Renounce a particular amount of votes.
                renounce = input.votes;
                *votes -= renounce;
                proposal_data.1.votes -= renounce;
            } else {
                // Renounce all.
                renounce = *votes;
                *votes -= renounce;
                proposal_data.1.votes -= renounce;
            }
        } else {
            return Err(DAOError::Unauthorized.into());
        }
    }

    logger.log(&DAOEvent::Renounced {
        proposal_id: input.proposal_id,
        voter,
        total_votes: proposal_data.1.votes,
    })?;

    // Incrementing the voting power of the voter.
    for (account, power) in state.members.iter_mut() {
        if *account == voter {
            *power += renounce;
        }
    }

    Ok(())
}

/// Function to fetch all proposals.
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

/// Function to fetch all members.
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

/// Function to fetch voting power of a particular account.
#[receive(
    contract = "DAO",
    name = "get_power",
    parameter = "AddressInput",
    return_value = "u64",
    error = "DAOError"
)]
fn dao_get_power(ctx: &ReceiveContext, host: &Host<DAOState>) -> ReceiveResult<u64> {
    let input: AddressInput = ctx.parameter_cursor().get()?;
    let state = host.state();

    for (address, power) in state.members.iter() {
        if *address == input.address {
            return Ok(*power);
        }
    }

    Ok(0)
}

/// Function to insert some CCD into DAO, allowed to anyone. This will grant membership in DAO.
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

/// Function to withraw the fund for an approved proposal from contract; can only be invoked by the proposer.
#[receive(
    contract = "DAO",
    name = "withdraw",
    parameter = "WithdrawInput",
    mutable
)]
fn dao_withdraw(ctx: &ReceiveContext, host: &mut Host<DAOState>) -> ReceiveResult<()> {
    let input: WithdrawInput = ctx.parameter_cursor().get()?;
    let caller = ctx.invoker();

    // Extract necessary information without borrowing state
    let (proposal_status, proposal_amount) = {
        let state = host.state();
        let mut found_proposal = None;

        for (id, p) in &state.proposals {
            if *id == input.proposal_id && p.proposer == caller {
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
        if *id == input.proposal_id {
            // Perform the transfer
            p.status = Status::Collected;
            return Ok(host.invoke_transfer(&caller, proposal_amount)?);
        }
    }

    Ok(())
}
