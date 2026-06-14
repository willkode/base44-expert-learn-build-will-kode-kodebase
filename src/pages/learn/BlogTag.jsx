import React from "react";
import { useParams } from "react-router-dom";
import BlogTaxonomyPage from "@/components/learn/BlogTaxonomyPage";

export default function BlogTag() {
  const { slug } = useParams();
  return <BlogTaxonomyPage kind="tag" slug={slug} />;
}