use concordium_smart_contract_testing::*;
use contract::*;

/// A test account.
const ACC_ADDR_OWNER: AccountAddress = AccountAddress([0u8; 32]);
const ACC_ADDR_OTHER: AccountAddress = AccountAddress([0u8; 32]);

/// The initial balance of the ALICE test account.
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
            Energy::from(10000),
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
        Energy::from(10000),
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
