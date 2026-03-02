#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, Clone, PartialEq)]
pub enum OrderState {
    Created,
    Executed,
    Refunded,
}

#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi)]
pub struct Order<M: ManagedTypeApi> {
    pub order_id: ManagedBuffer<M>,
    pub buyer: ManagedAddress<M>,
    pub provider: ManagedAddress<M>,
    pub agent_id: ManagedBuffer<M>,
    pub amount: BigUint<M>,
    pub token_identifier: TokenIdentifier<M>,
    pub state: OrderState,
    pub created_at: u64,
}

mod agent_registry_proxy {
    multiversx_sc::imports!();

    #[multiversx_sc::proxy]
    pub trait AgentRegistryProxy {
        #[endpoint(recordOrderCompletion)]
        fn record_order_completion(&self, agent_id: ManagedBuffer);
    }
}

/// CommerceEngine Smart Contract
/// Handles order lifecycle, on-chain ACP checkout, and agent reputation updates
#[multiversx_sc::contract]
pub trait CommerceEngine {
    #[init]
    fn init(&self, agent_registry_address: ManagedAddress) {
        self.agent_registry_address().set(&agent_registry_address);
    }

    #[payable("*")]
    #[endpoint(createOrder)]
    fn create_order(
        &self,
        order_id: ManagedBuffer,
        provider: ManagedAddress,
        agent_id: ManagedBuffer,
    ) {
        let (token, amount) = self.call_value().single_fungible_tc();
        let caller = self.blockchain().get_caller();
        
        require!(
            self.orders(&order_id).is_empty(),
            "Order already exists"
        );
        require!(amount > 0, "Amount must be greater than zero");

        let order = Order {
            order_id: order_id.clone(),
            buyer: caller,
            provider,
            agent_id,
            amount,
            token_identifier: token,
            state: OrderState::Created,
            created_at: self.blockchain().get_block_timestamp(),
        };

        self.orders(&order_id).set(order);
        self.order_created_event(&order_id);
    }

    #[endpoint(executeOrder)]
    fn execute_order(&self, order_id: ManagedBuffer) {
        require!(!self.orders(&order_id).is_empty(), "Order not found");
        
        let mut order = self.orders(&order_id).get();
        require!(order.state == OrderState::Created, "Invalid order state");
        
        let caller = self.blockchain().get_caller();
        require!(
            caller == order.provider || caller == self.blockchain().get_owner_address(),
            "Unauthorized"
        );

        self.send().direct(
            &order.provider,
            &order.token_identifier,
            0,
            &order.amount
        );

        order.state = OrderState::Executed;
        self.orders(&order_id).set(&order);

        let registry_address = self.agent_registry_address().get();
        if !registry_address.is_zero() {
            self.agent_registry_proxy(registry_address)
                .record_order_completion(order.agent_id.clone())
                .async_call()
                .call_and_exit_ignore_callback();
        }
            
        self.order_executed_event(&order_id);
    }

    #[endpoint(refundOrder)]
    fn refund_order(&self, order_id: ManagedBuffer) {
        require!(!self.orders(&order_id).is_empty(), "Order not found");
        
        let mut order = self.orders(&order_id).get();
        require!(order.state == OrderState::Created, "Invalid order state");
        
        let caller = self.blockchain().get_caller();
        require!(
            caller == order.provider || caller == order.buyer || caller == self.blockchain().get_owner_address(),
            "Unauthorized"
        );

        self.send().direct(
            &order.buyer,
            &order.token_identifier,
            0,
            &order.amount
        );

        order.state = OrderState::Refunded;
        self.orders(&order_id).set(&order);
        
        self.order_refunded_event(&order_id);
    }

    #[view(getOrder)]
    fn get_order(&self, order_id: ManagedBuffer) -> Order<Self::Api> {
        require!(!self.orders(&order_id).is_empty(), "Order not found");
        self.orders(&order_id).get()
    }

    #[proxy]
    fn agent_registry_proxy(&self, to: ManagedAddress) -> agent_registry_proxy::Proxy<Self::Api>;

    #[event("orderCreated")]
    fn order_created_event(&self, #[indexed] order_id: &ManagedBuffer);

    #[event("orderExecuted")]
    fn order_executed_event(&self, #[indexed] order_id: &ManagedBuffer);

    #[event("orderRefunded")]
    fn order_refunded_event(&self, #[indexed] order_id: &ManagedBuffer);

    #[storage_mapper("orders")]
    fn orders(&self, order_id: &ManagedBuffer) -> SingleValueMapper<Order<Self::Api>>;

    #[storage_mapper("agentRegistryAddress")]
    fn agent_registry_address(&self) -> SingleValueMapper<ManagedAddress>;
}