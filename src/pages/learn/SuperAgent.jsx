import React from "react";
import Seo from "@/components/seo/Seo";
import Hero from "@/components/learn/superagent/Hero";
import MentalModel from "@/components/learn/superagent/MentalModel";
import Capabilities from "@/components/learn/superagent/Capabilities";
import Boundaries from "@/components/learn/superagent/Boundaries";
import UseCases from "@/components/learn/superagent/UseCases";
import Patterns from "@/components/learn/superagent/Patterns";
import SecurityModel from "@/components/learn/superagent/SecurityModel";
import Limits from "@/components/learn/superagent/Limits";
import Rules from "@/components/learn/superagent/Rules";

export default function SuperAgent() {
  return (
    <>
      <Seo
        title="Base44 AI Agent Explained — Capabilities & Limits | KodeBase"
        description="A privileged, skill-driven automation operator with cross-app read access and single-app write control. Build powerful workflows with a dumb trigger and a smart handler."
        path="/learn/superagent"
      />
      <Hero />
      <MentalModel />
      <Capabilities />
      <Boundaries />
      <UseCases />
      <Patterns />
      <SecurityModel />
      <Limits />
      <Rules />
    </>
  );
}