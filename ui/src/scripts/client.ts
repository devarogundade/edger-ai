import axios from "axios";
import type { Activity, AgentJson, Chat, Post } from "./types";
import type { Hex } from "viem";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

const Client = {
  async createPost(post_json: Post): Promise<boolean> {
    try {
      const response = await api.post(`/posts/create`, {
        post: post_json,
      });
      return Boolean(response.data);
    } catch (error) {
      return false;
    }
  },

  async getPosts(page: number, limit: number): Promise<Post[]> {
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getActivities(
    initiator: Hex,
    page: number,
    limit: number
  ): Promise<Activity[]> {
    try {
      const response = await api.get(
        `/activities?initiator=${initiator}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getAgents(
    visibility: string,
    page: number,
    limit: number,
    creator: Hex | null = null
  ): Promise<AgentJson[]> {
    try {
      const response = await api.get(
        `/agents?page=${page}&limit=${limit}&database=${true}&creator=${
          creator ? creator : ""
        }&visibility=${visibility}`
      );
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getAgent(strategyAddress: Hex): Promise<AgentJson | null> {
    try {
      const response = await api.get(
        `/agents/${strategyAddress}?database=${true}`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async createAgent(agentJson: AgentJson): Promise<boolean> {
    try {
      const response = await api.post(`/agents/create?database=${true}`, {
        agent_json: agentJson,
      });
      return Boolean(response.data);
    } catch (error) {
      return false;
    }
  },

  async loadAgent(strategyAddress: Hex): Promise<boolean> {
    try {
      const response = await api.post(
        `/agents/${strategyAddress}/load?database=${true}`
      );
      return Boolean(response.data);
    } catch (error) {
      return false;
    }
  },

  async startAgent(strategyAddress: Hex): Promise<boolean> {
    try {
      const response = await api.post(`/agents/${strategyAddress}/start`);
      return Boolean(response.data);
    } catch (error) {
      return false;
    }
  },

  async stopAgent(strategyAddress: Hex): Promise<boolean> {
    try {
      const response = await api.post(`/agents/${strategyAddress}/stop`);
      return Boolean(response.data);
    } catch (error) {
      return false;
    }
  },

  async chatAgent(
    strategyAddress: Hex,
    user: Hex,
    prompt: string
  ): Promise<boolean> {
    try {
      const response = await api.post(
        `/agents/${strategyAddress}/chat?user=${user}&database=${true}`,
        { prompt }
      );
      return Boolean(response.data);
    } catch (error) {
      return false;
    }
  },

  async chats(strategyAddress: Hex, user: Hex): Promise<Chat[]> {
    try {
      const response = await api.get(
        `/agents/${strategyAddress}/chats?user=${user}&database=${true}`
      );
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export default Client;
