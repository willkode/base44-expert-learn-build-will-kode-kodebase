import React from "react";
import { useParams } from "react-router-dom";
import BlogTaxonomyPage from "@/components/learn/BlogTaxonomyPage";

export default function BlogCategory() {
  const { slug } = useParams();
  return <BlogTaxonomyPage kind="category" slug={slug} />;
}