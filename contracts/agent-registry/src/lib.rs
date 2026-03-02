#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

/// Agent rank enum for gamification
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, Clone, PartialEq)]
pub enum AgentRank {
    Bronze,
    Silver,
    Gold,
    Diamond,
}

/// Agent data stored on-chain
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi)]
pub struct AgentData<M: ManagedTypeApi> {
    pub owner: ManagedAddress<M>,
    pub metadata_url: ManagedBuffer<M>,
    pub trust_score: u64,
    pub xp: u64,
    pub rank: AgentRank,
    pub completed_orders: u64,
    pub registered_at: u64,
}

/// AgentRegistry Smart Contract
/// Handles agent registration, XP tracking, trust scores, and gamification
#[multiversx_sc::contract]
pub trait AgentRegistry {

    #[init]
    fn init(&self) {}

    // ============================================================
    // ENDPOINTS
    // ============================================================

    /// Register a new AI agent on-chain
    #[endpoint(registerAgent)]
    fn register_agent(
        &self,
        agent_id: ManagedBuffer,
        metadata_url: ManagedBuffer,
    ) {
        let caller = self.blockchain().get_caller();
        require!(
            !self.agents(&agent_id).is_empty(),
            "Agent already registered"
        );

        let agent = AgentData {
            owner: caller,
            metadata_url,
            trust_score: 0u64,
            xp: 0u64,
            rank: AgentRank::Bronze,
            completed_orders: 0u64,
            registered_at: self.blockchain().get_block_timestamp(),
        };

        self.agents(&agent_id).set(agent);
        self.agent_registered_event(&agent_id);
    }

    /// Update agent trust score (only callable by authorized contracts)
    #[endpoint(updateTrustScore)]
    fn update_trust_score(
        &self,
        agent_id: ManagedBuffer,
        delta: i64,
    ) {
        self.require_authorized();
        require!(!self.agents(&agent_id).is_empty(), "Agent not found");

        let mut agent = self.agents(&agent_id).get();
        if delta > 0 {
            agent.trust_score += delta as u64;
            agent.xp += delta as u64 * 10; // 10 XP per trust point
        } else {
            let decrease = (-delta) as u64;
            if agent.trust_score >= decrease {
                agent.trust_score -= decrease;
            } else {
                agent.trust_score = 0;
            }
        }

        // Update rank based on trust score
        agent.rank = self.calculate_rank(agent.trust_score);
        self.agents(&agent_id).set(agent);
    }

    /// Record completed order for agent
    #[endpoint(recordOrderCompletion)]
    fn record_order_completion(
        &self,
        agent_id: ManagedBuffer,
    ) {
        self.require_authorized();
        require!(!self.agents(&agent_id).is_empty(), "Agent not found");

        let mut agent = self.agents(&agent_id).get();
        agent.completed_orders += 1;
        agent.trust_score += 5; // +5 per order
        agent.xp += 100; // +100 XP per order
        agent.rank = self.calculate_rank(agent.trust_score);
        self.agents(&agent_id).set(agent);
    }

    /// Set authorized caller (commerce engine)
    #[only_owner]
    #[endpoint(setAuthorizedCaller)]
    fn set_authorized_caller(&self, address: ManagedAddress) {
        self.authorized_caller().set(address);
    }

    // ============================================================
    // VIEWS
    // ============================================================

    #[view(getAgentScore)]
    fn get_agent_score(&self, agent_id: ManagedBuffer) -> u64 {
        if self.agents(&agent_id).is_empty() {
            return 0;
        }
        self.agents(&agent_id).get().trust_score
    }

    #[view(getAgentData)]
    fn get_agent_data(&self, agent_id: ManagedBuffer) -> AgentData<Self::Api> {
        require!(!self.agents(&agent_id).is_empty(), "Agent not found");
        self.agents(&agent_id).get()
    }

    #[view(getAgentRank)]
    fn get_agent_rank(&self, agent_id: ManagedBuffer) -> AgentRank {
        if self.agents(&agent_id).is_empty() {
            return AgentRank::Bronze;
        }
        self.agents(&agent_id).get().rank
    }

    // ============================================================
    // PRIVATE
    // ============================================================

    fn require_authorized(&self) {
        let caller = self.blockchain().get_caller();
        let authorized = self.authorized_caller().get();
        require!(caller == authorized || caller == self.blockchain().get_owner_address(), "Unauthorized");
    }

    fn calculate_rank(&self, trust_score: u64) -> AgentRank {
        if trust_score >= 10000 {
            AgentRank::Diamond
        } else if trust_score >= 1000 {
            AgentRank::Gold
        } else if trust_score >= 100 {
            AgentRank::Silver
        } else {
            AgentRank::Bronze
        }
    }

    // ============================================================
    // EVENTS
    // ============================================================

    #[event("agentRegistered")]
    fn agent_registered_event(&self, #[indexed] agent_id: &ManagedBuffer);

    #[event("trustScoreUpdated")]
    fn trust_score_updated_event(
        &self,
        #[indexed] agent_id: &ManagedBuffer,
        new_score: u64,
    );

    // ============================================================
    // STORAGE
    // ============================================================

    #[storage_mapper("agents")]
    fn agents(&self, agent_id: &ManagedBuffer) -> SingleValueMapper<AgentData<Self::Api>>;

    #[storage_mapper("authorizedCaller")]
    fn authorized_caller(&self) -> SingleValueMapper<ManagedAddress>;
}
