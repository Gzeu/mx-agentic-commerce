#![no_std]

multiversx_sc::imports!();

/// ReputationNFT Smart Contract
/// Handles issuing NFT receipts for completed agentic commerce orders and badges for reputation.
#[multiversx_sc::contract]
pub trait ReputationNft {
    #[init]
    fn init(&self) {}

    #[only_owner]
    #[endpoint(issueToken)]
    fn issue_token(&self, token_name: ManagedBuffer, token_ticker: ManagedBuffer) {
        require!(self.nft_token_id().is_empty(), "Token already issued");
        
        let payment_amount = self.call_value().egld_value().clone_value();
        self.send()
            .esdt_system_sc_proxy()
            .issue_non_fungible(
                payment_amount,
                &token_name,
                &token_ticker,
                NonFungibleTokenProperties {
                    can_freeze: true,
                    can_wipe: true,
                    can_pause: true,
                    can_change_owner: true,
                    can_upgrade: true,
                    can_add_special_roles: true,
                },
            )
            .async_call()
            .with_callback(self.callbacks().issue_callback())
            .call_and_exit();
    }

    #[callback]
    fn issue_callback(
        &self,
        #[call_result] result: ManagedAsyncCallResult<TokenIdentifier>,
    ) {
        match result {
            ManagedAsyncCallResult::Ok(token_id) => {
                self.nft_token_id().set(&token_id);
                self.send()
                    .esdt_system_sc_proxy()
                    .set_special_roles(
                        &self.blockchain().get_sc_address(),
                        &token_id,
                        [EsdtLocalRole::NftCreate][..].iter().cloned(),
                    )
                    .async_call()
                    .call_and_exit_ignore_callback();
            }
            ManagedAsyncCallResult::Err(_) => {
                // Token issuance failed
            }
        }
    }

    #[endpoint(mintReceipt)]
    fn mint_receipt(
        &self, 
        to: ManagedAddress, 
        order_id: ManagedBuffer, 
        metadata: ManagedBuffer
    ) {
        self.require_authorized();
        require!(!self.nft_token_id().is_empty(), "Token not issued yet");

        let token_id = self.nft_token_id().get();
        let amount = BigUint::from(1u32);
        
        let mut attributes = ManagedBuffer::new();
        attributes.append(&order_id);
        attributes.append(&ManagedBuffer::from(";"));
        attributes.append(&metadata);

        let empty_buffer = ManagedBuffer::new();
        let mut uris = ManagedVec::new();
        uris.push(metadata.clone()); 

        let nonce = self.send().esdt_nft_create(
            &token_id,
            &amount,
            &empty_buffer,
            &BigUint::zero(),
            &empty_buffer,
            &attributes,
            &uris,
        );

        self.send().direct_esdt(&to, &token_id, nonce, &amount);
    }

    #[endpoint(awardBadge)]
    fn award_badge(&self, to: ManagedAddress, badge_type: u8) {
        self.require_authorized();
        require!(!self.nft_token_id().is_empty(), "Token not issued yet");

        let token_id = self.nft_token_id().get();
        let amount = BigUint::from(1u32);
        
        let mut attributes = ManagedBuffer::new();
        attributes.append(&ManagedBuffer::from("badge_type:"));
        
        let mut badge_str = ManagedBuffer::new();
        // Simplifying badge type to buffer conversion for snippet purposes
        attributes.append(&badge_str);

        let empty_buffer = ManagedBuffer::new();
        let uris = ManagedVec::new();

        let nonce = self.send().esdt_nft_create(
            &token_id,
            &amount,
            &empty_buffer,
            &BigUint::zero(),
            &empty_buffer,
            &attributes,
            &uris,
        );

        self.send().direct_esdt(&to, &token_id, nonce, &amount);
    }

    #[only_owner]
    #[endpoint(setAuthorizedCaller)]
    fn set_authorized_caller(&self, address: ManagedAddress) {
        self.authorized_caller().set(address);
    }

    fn require_authorized(&self) {
        let caller = self.blockchain().get_caller();
        let authorized = self.authorized_caller().get();
        require!(caller == authorized || caller == self.blockchain().get_owner_address(), "Unauthorized");
    }

    #[storage_mapper("nftTokenId")]
    fn nft_token_id(&self) -> SingleValueMapper<TokenIdentifier>;

    #[storage_mapper("authorizedCaller")]
    fn authorized_caller(&self) -> SingleValueMapper<ManagedAddress>;
}