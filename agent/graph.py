from langgraph.graph import StateGraph, START, END

from agent.state import PricingState
from agent.nodes import get_products_node, process_products_node


graph = StateGraph(PricingState)


graph.add_node("get_products",get_products_node)
graph.add_node("process_products",process_products_node)


graph.add_edge(START,"get_products")
graph.add_edge("get_products","process_products")
graph.add_edge("process_products",END)


pricing_agent = graph.compile()