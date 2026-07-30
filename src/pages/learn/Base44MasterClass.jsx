import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { SITE, canonical } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import MasterClassHero from "@/components/learn/masterclass/MasterClassHero";
import MasterClassEnroll from "@/components/learn/masterclass/MasterClassEnroll";
import MasterClassFormat from "@/components/learn/masterclass/MasterClassFormat";
import MasterClassCurriculum from "@/components/learn/masterclass/MasterClassCurriculum";
import MasterClassAddOns from "@/components/learn/masterclass/MasterClassAddOns";
import MasterClassCertifications from "@/components/learn/masterclass/MasterClassCertifications";
import MasterClassInstructor from "@/components/learn/masterclass/MasterClassInstructor";
import { CLASS_INFO } from "@/components/learn/masterclass/masterClassData";

const PATH = "/learn/base44-master-class";
const OG_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4abc9a14f_generated_image.png";

export default function Base44MasterClass() {
  useEffect(() => {
    trackEvent("view_master_class", {
      page_path: PATH,
      start_date: CLASS_INFO.startIso,
      price_cents: CLASS_INFO.priceCents,
      seats: CLASS_INFO.seats,
    });
  }, []);

  return (
    <>
      <Seo
        title="Base44 Master Class — 20-Week Vibe Coding Academy ($99, 100 Seats)"
        description="Live 20-week Base44 Master Class starting Aug 10, 2026. Learn to plan, build, test, secure, launch, market, and sell web, mobile, and desktop apps with Base44 and Claude. $99 per seat — only 100 seats."
        path={PATH}
        type="article"
        image={OG_IMAGE}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Course",
            name: "Base44 Master Class — Vibe Coding Mastery Academy",
            description:
              "A 20-week live program teaching students to plan, build, test, secure, launch, market, and sell web, mobile, and desktop applications using Base44, Claude, and modern AI development workflows.",
            url: canonical(PATH),
            provider: { "@type": "Organization", name: SITE.name, logo: SITE.logo },
            image: OG_IMAGE,
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "online",
              startDate: CLASS_INFO.startIso,
              courseWorkload: "P1W5H",
              maximumAttendeeCapacity: CLASS_INFO.seats,
              instructor: { "@type": "Person", name: "Will Kode" },
              offers: {
                "@type": "Offer",
                price: "99.00",
                priceCurrency: "USD",
                availability: "https://schema.org/LimitedAvailability",
                url: canonical(PATH),
              },
            },
          },
        ]}
      />
      <MasterClassHero />
      <MasterClassEnroll />
      <MasterClassFormat />
      <MasterClassCurriculum />
      <MasterClassAddOns />
      <MasterClassCertifications />
      <MasterClassInstructor />
      <MasterClassEnroll id="enroll-bottom" />
    </>
  );
}