use concordium_smart_contract_testing::*;
use contract::*;

/// A test account.
const ACC_ADDR_OWNER: AccountAddress = AccountAddress([0u8; 32]);
const ACC_ADDR_OTHER: AccountAddress = AccountAddress([0u8; 32]);

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
            Signer::with_one_key(),
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
    let (mut chain, initialization) = setup_chain_and_contract();
    let insert_amount = Amount::from_ccd(10);

    // Insert 10 CCD.
    let update = chain.contract_update(
        Signer::with_one_key(),
        ACC_ADDR_OWNER,
        Address::Account(ACC_ADDR_OWNER),
        Energy::from(10_000),
        UpdateContractPayload {
            amount: insert_amount,
            address: initialization.contract_address,
            receive_name: OwnedReceiveName::new_unchecked("DAO.insert".to_string()),
            message: OwnedParameter::empty(),
        },
    );

    assert!(update.is_ok());
    assert_eq!(
        chain.contract_balance(initialization.contract_address),
        Some(insert_amount)
    );
}

#[test]
fn test_add_member() {
    let (mut chain, init) = setup_chain_and_contract();

    let update = chain
        .contract_update(
            SIGNER,
            ACC_ADDR_OWNER,
            Address::Account(ACC_ADDR_OWNER),
            Energy::from(10_000),
            UpdateContractPayload {
                address: init.contract_address,
                amount: Amount::zero(),
                receive_name: OwnedReceiveName::new_unchecked("DAO.add_member".to_string()),
                message: OwnedParameter::from_serial(&ACC_ADDR_OTHER).expect("Added new member"),
            },
        )
        .expect("Update succeeds with new member.");

    check_event(
        &update,
        DAOEvent::MemberAdded {
            address: ACC_ADDR_OTHER,
        },
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
                message: OwnedParameter::from_serial(&input).expect("Created proposal"),
            },
        )
        .expect("Update succeeds with new proposal.");

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
                message: OwnedParameter::from_serial(&input).expect("Created proposal"),
            },
        )
        .expect("Update succeeds with new proposal.");

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
                message: OwnedParameter::from_serial(&input).expect("Created proposal"),
            },
        )
        .expect("Update succeeds with new proposal.");

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
        .expect("Invoke add_proposals");

    let return_value: Vec<(u64, Proposal)> = invoke
        .parse_return_value()
        .expect("add_proposals return value");
    let expected_value = vec![
        (
            0,
            Proposal {
                proposer: ACC_ADDR_OWNER,
                description: input.description.clone(),
                amount: input.amount,
                votes_for: 0,
                votes_against: 0,
                status: Status::Active,
            },
        ),
        (
            1,
            Proposal {
                proposer: ACC_ADDR_OTHER,
                description: input.description,
                amount: input.amount,
                votes_for: 0,
                votes_against: 0,
                status: Status::Active,
            },
        ),
    ];

    assert_eq!(return_value, expected_value);
}

fn check_event(update: &ContractInvokeSuccess, event: DAOEvent) {
    let events: Vec<DAOEvent> = update
        .events()
        .flat_map(|(_addr, events)| events.iter().map(|e| e.parse().expect("Deserialize event")))
        .collect();
    assert_eq!(events, [event]);
}
