use concordium_smart_contract_testing::*;
use concordium_std_derive::*;
use contract::*;

const ACC_ADDR_OWNER: AccountAddress =
    account_address!("2xBpaHottqhwFZURMZW4uZduQvpxNDSy46iXMYs9kceNGaPpZX");
const ACC_ADDR_OTHER: AccountAddress =
    account_address!("2xdTv8awN1BjgYEw8W1BVXVtiEwG2b29U8KoZQqJrDuEqddseE");

/// A [`Signer`] with one set of keys, used for signing transactions.
const SIGNER: Signer = Signer::with_one_key();

/// The initial balance for the test accounts.
const ACC_INITIAL_BALANCE: Amount = Amount::from_ccd(10_000);

fn setup_chain_and_contract() -> (Chain, ContractInitSuccess) {
    let mut chain = Chain::new();

    chain.create_account(Account::new(ACC_ADDR_OWNER, ACC_INITIAL_BALANCE));
    chain.create_account(Account::new(ACC_ADDR_OTHER, ACC_INITIAL_BALANCE));

    let module = module_load_v1("./dist/module.wasm.v1").expect("Module exists and is valid");
    let deployment = chain
        .module_deploy_v1(Signer::with_one_key(), ACC_ADDR_OWNER, module)
        .expect("Deploying valid module should succeed");

    let initialization = chain
        .contract_init(
            SIGNER,
            ACC_ADDR_OWNER,
            Energy::from(10_000),
            InitContractPayload {
                amount: Amount::zero(),
                mod_ref: deployment.module_reference,
                init_name: OwnedContractName::new_unchecked("init_DAO".to_string()),
                param: OwnedParameter::empty(),
            },
        )
        .expect("Initialization should always succeed");

    (chain, initialization)
}

fn check_event(update: &ContractInvokeSuccess, event: DAOEvent) {
    let events: Vec<DAOEvent> = update
        .events()
        .flat_map(|(_addr, events)| events.iter().map(|e| e.parse().expect("Deserialize event")))
        .collect();
    assert_eq!(events, [event]);
}

#[test]
fn test_init() {
    let (chain, initialization) = setup_chain_and_contract();
    assert_eq!(
        chain.contract_balance(initialization.contract_address),
        Some(Amount::zero()),
        "DAO is not initialized with balance of zero"
    );
}

#[test]
fn test_insert() {
    let (mut chain, init) = setup_chain_and_contract();
    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    let update = chain.contract_update(
        SIGNER,
        ACC_ADDR_OWNER,
        Address::Account(ACC_ADDR_OWNER),
        Energy::from(10_000),
        UpdateContractPayload {
            amount: insert_amount,
            address: init.contract_address,
            receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
            message: OwnedParameter::empty(),
        },
    );

    assert!(update.is_ok());
    assert_eq!(
        chain.contract_balance(init.contract_address),
        Some(insert_amount),
        "DAO is not updated with balance of 10 CCD"
    );
}

#[test]
fn test_create_proposal() {
    let (mut chain, init) = setup_chain_and_contract();

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    check_event(
        &update,
        DAOEvent::ProposalCreated {
            proposal_id: 0,
            description: input.description,
            amount: input.amount,
        },
    )
}

#[test]
fn test_all_proposals() {
    let (mut chain, init) = setup_chain_and_contract();

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let invoke = chain
        .contract_invoke(
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.all_proposals".to_string()),
                address: init.contract_address,
                message: OwnedParameter::empty(),
            },
        )
        .expect("Fetch all proposals");

    let return_value: Vec<(u64, Proposal)> =
        invoke.parse_return_value().expect("Proposals return value");
    let expected_value = vec![
        (
            0,
            Proposal {
                proposer: ACC_ADDR_OWNER,
                description: input.description.clone(),
                amount: input.amount,
                votes: 0,
                status: Status::Active,
            },
        ),
        (
            1,
            Proposal {
                proposer: ACC_ADDR_OTHER,
                description: input.description,
                amount: input.amount,
                votes: 0,
                status: Status::Active,
            },
        ),
    ];

    assert_eq!(return_value, expected_value);
}

#[test]
fn test_authorized_vote() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new insert");

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let v = VoteInput {
        proposal_id: 0,
        votes: 100,
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect("Update succeeds with new vote");

    let invoke = chain
        .contract_invoke(
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.all_proposals".to_string()),
                address: init.contract_address,
                message: OwnedParameter::empty(),
            },
        )
        .expect("Fetch all proposals");

    let return_value: Vec<(u64, Proposal)> =
        invoke.parse_return_value().expect("Proposals return value");
    let expected_value = vec![(
        0,
        Proposal {
            proposer: ACC_ADDR_OWNER,
            description: input.description.clone(),
            amount: input.amount,
            votes: 100,
            status: Status::Active,
        },
    )];

    assert_eq!(return_value, expected_value);
}

#[test]
fn test_unauthorized_vote() {
    let (mut chain, init) = setup_chain_and_contract();

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let v = VoteInput {
        proposal_id: 0,
        votes: 100,
    };

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect_err("Update succeeds with new vote");

    let rv: DAOError = update.parse_return_value().expect("Deserialize Error");
    assert_eq!(rv, DAOError::Unauthorized);
}

#[test]
fn test_empty_vote() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new insert");

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let v = VoteInput {
        proposal_id: 0,
        votes: 10_000_000,
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect("Update succeeds with new vote");

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect_err("Update succeeds with new vote");

    let rv: DAOError = update.parse_return_value().expect("Deserialize Error");
    assert_eq!(rv, DAOError::Unauthorized);
}

#[test]
fn test_not_found() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new insert");

    let v = VoteInput {
        proposal_id: 0,
        votes: 100,
    };

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect_err("Update succeeds with new vote");

    let rv: DAOError = update.parse_return_value().expect("Deserialize Error");
    assert_eq!(rv, DAOError::ProposalNotFound);
}

#[test]
fn test_unauthorized_withdraw() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new fund");

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let v = VoteInput {
        proposal_id: 0,
        votes: 100,
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect("Update succeeds with new vote");

    let id: u64 = 0;

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.withdraw".to_string()),
                message: OwnedParameter::from_serial(&id).expect("Withdraw fund"),
            },
        )
        .expect_err("Update succeeds with withdrawal");

    let rv: DAOError = update.parse_return_value().expect("Deserialize Error");
    assert_eq!(rv, DAOError::Unauthorized);
}

#[test]
fn test_double_withdraw() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new fund");

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let v = VoteInput {
        proposal_id: 0,
        votes: 100_000,
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect("Update succeeds with new vote");

    let id: u64 = 0;

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.withdraw".to_string()),
                message: OwnedParameter::from_serial(&id).expect("Withdraw fund"),
            },
        )
        .expect("Update succeeds with withdrawal");

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.withdraw".to_string()),
                message: OwnedParameter::from_serial(&id).expect("Withdraw fund"),
            },
        )
        .expect_err("Update succeeds with withdrawal");

    let rv: DAOError = update.parse_return_value().expect("Deserialize Error");
    assert_eq!(rv, DAOError::AmountCollected);
}

#[test]
fn test_unapproved_withdraw() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new fund");

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let id: u64 = 0;

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.withdraw".to_string()),
                message: OwnedParameter::from_serial(&id).expect("Withdraw fund"),
            },
        )
        .expect_err("Update succeeds with withdrawal");

    let rv: DAOError = update.parse_return_value().expect("Deserialize Error");
    assert_eq!(rv, DAOError::NotApproved);
}

#[test]
fn test_approved_withdraw() {
    let (mut chain, init) = setup_chain_and_contract();

    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: insert_amount,
                address: init.contract_address,
                receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
                message: OwnedParameter::empty(),
            },
        )
        .expect("Update succeeds with new fund");

    let input = ProposalInput {
        description: "Kerala Flood Relief".to_string(),
        amount: Amount { micro_ccd: 100_000 },
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.create_proposal".to_string()),
                message: OwnedParameter::from_serial(&input).expect("Create proposal"),
            },
        )
        .expect("Update succeeds with new proposal");

    let v = VoteInput {
        proposal_id: 0,
        votes: 100_000,
    };

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.vote".to_string()),
                message: OwnedParameter::from_serial(&v).expect("Vote proposal"),
            },
        )
        .expect("Update succeeds with new vote");

    let id: u64 = 0;

    chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OTHER,
            Address::Account(ACC_ADDR_OTHER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.withdraw".to_string()),
                message: OwnedParameter::from_serial(&id).expect("Withdraw fund"),
            },
        )
        .expect("Update succeeds with withdrawal");

    let invoke = chain
        .contract_invoke(
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.all_proposals".to_string()),
                address: init.contract_address,
                message: OwnedParameter::empty(),
            },
        )
        .expect("Fetch all proposals");

    let return_value: Vec<(u64, Proposal)> =
        invoke.parse_return_value().expect("Proposals return value");
    let expected_value = vec![(
        0,
        Proposal {
            proposer: ACC_ADDR_OTHER,
            description: input.description.clone(),
            amount: input.amount,
            votes: 100_000,
            status: Status::Collected,
        },
    )];

    assert_eq!(return_value, expected_value);

    let bal = chain
        .account_balance_available(ACC_ADDR_OTHER)
        .expect("Balance of Owner");
    assert_ne!(bal, ACC_INITIAL_BALANCE)
}
