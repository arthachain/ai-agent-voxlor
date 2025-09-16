import { createFileRoute } from "@tanstack/react-router";
import AIAgentsPage from "../pages/ai-agents";

export const Route = createFileRoute("/ai-agents")({
  component: AIAgentsPage,
});
