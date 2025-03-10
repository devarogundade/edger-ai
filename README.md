Introduction ✨
A strategy in EdgerAI is a combination of an AI agent, trading instructions, and a smart contract liquidity pool. The AI agent autonomously executes trades between the liquidity pool tokens based on predefined conditions and real-time market signals. Users can share, publicize, and monetize their AI-driven strategies, fostering a collaborative and innovative trading ecosystem.
What it does 👌
EdgerAI allows users to define trading conditions based on Twitter trends, Discord messages, and other social signals, bringing a new level of automation to on-chain trading. The platform is built on the Sonic Blockchain for secure, transparent trade execution.
Users can also fork (or clone) public strategies by paying a fee set by the  creator, that is rewarding the original creator and incentivizing knowledge sharing.
With interactive AI agents, traders can engage with their strategies like they would with ChatGPT or DeepSeek, understanding the logic behind the AI-agents trade executions. For example, you may ask a strategy which actions would have made if Elon Musk tweets $SONIC as a means to buy a tesla.
The platform also features a social trading feed where users can showcase performance, discuss strategies, and interact with the community. A built-in voting mechanism ensures that the best-performing strategies rise to the top, giving users better insights into profitable AI-driven trades.
How we built it 🛠️
Sonic Blockchain
We deployed our smart contracts on the Sonic Blockchain, including an oracle contract that interacts with Chainlink data feeds to fetch real-time token prices. The multi-token liquidity pool contract provides key functions like "swap to single," allowing multiple tokens to be swapped into a single asset via SpookySwap UniswapV2 router, and "swap to many," enabling a single token to be exchanged for multiple assets in the pool. Sonic Blockchain is ideal for our use case due to its fast finality and low transaction costs, both of which are crucial for AI-driven autonomous trading based on real-time social events.
View Code
ZerePy
Building a multi-AI agent system from scratch is complex, but ZerePy significantly simplified the process by providing a robust framework with built-in integrations for various social media platforms. Instead of reinventing the wheel, we cloned the ZerePy GitHub repository and customized it to fit our needs.
One key enhancement we made was integrating MongoDB as an alternative data source for storing and loading AI agents, instead of relying solely on the /agents folder. This allows us to scale to a larger number of users while improving indexing and retrieval efficiency.
To better manage multiple AI agents, we also deployed a secondary server instance ("server2"), enhancing scalability and API responsiveness. Additionally, we introduced a new action in the OpenAI connection class, called "generate_strategy_action", which functions similarly to "generate_text". This modification leverages OpenAI's tool calls to return structured function schemas, allowing AI agents to determine and execute specific actions on-chain within the liquidity pool.
View Code
VueJs
For the frontend, we used Vue.js to deliver a fast, responsive, and intuitive user experience, ensuring seamless interaction with AI agents, strategy management, and social trading features.
View Code
Flow Diagram ✒️

Potential impact
EdgerAI has the potential to redefine how traders interact with DeFi by introducing AI-powered automation to decentralized trading strategies. By enabling users to capitalize on real-time social signals, EdgerAI enhances market responsiveness and creates new opportunities for profit generation. This not only democratizes algorithmic trading but also fosters an ecosystem where strategy creators are rewarded for their insights, promoting knowledge sharing and innovation.
Furthermore, EdgerAI lowers the barrier to entry for traders who lack coding expertise, as they can leverage pre-built AI strategies or fork existing ones. The introduction of a social trading feed and a voting mechanism enhances transparency and trust, allowing the best-performing strategies to gain visibility.
Beyond individual traders, the impact of EdgerAI extends to the broader DeFi landscape. By collaborating with other DeFi protocols, EdgerAI can introduce new automated trading mechanisms, improve liquidity efficiency, and contribute to the overall growth of decentralized finance. The platform’s future development, including advanced analytics and expanded AI capabilities, will further solidify its role as a pioneer in AI-driven DeFi automation.
What's next ?
Looking ahead, EdgerAI plans to expand its platform by incorporating additional social media integrations and enhancing AI capabilities to support more complex trading strategies. The development team is also focused on refining the user experience, making strategy creation and deployment more intuitive.
Collaborations with other DeFi platforms are on the horizon to broaden the range of automated actions available to users. Furthermore, EdgerAI intends to implement advanced analytics tools, enabling users to assess and optimize the performance of their AI agents effectively.
