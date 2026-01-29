"use client";
import { IntegrationsSelectorLightDesktop } from "./integrations-index-selector/integrations-selector-light-desktop";
import { IntegrationsSelectorDarkDesktop } from "./integrations-index-selector/integrations-selector-dark-desktop";
import {
  KiteIconLight,
  KiteIconDark,
} from "./integrations-index-selector/kite-icon";
import { IntegrationsSelectorLightMobile } from "./integrations-index-selector/integrations-selector-light-mobile";
import { IntegrationsSelectorDarkMobile } from "./integrations-index-selector/integrations-selector-dark-mobile";
import { IntegrationLinkRoundedButton } from "./integration-link-button/integration-link-rounded-button";
import { ComponentType, useRef, useEffect, useState } from "react";
import {
  INTEGRATION_ORDER,
  IntegrationId,
  getIntegration,
} from "@/lib/integrations";
import { hasIntegrationFeature } from "@/lib/integration-features";
import { AgentSpecMarkIcon, A2AIcon } from "@/lib/icons/custom-icons";
import AdkIcon from "../ui/icons/adk";
import Ag2Icon from "../ui/icons/ag2";
import CrewaiIcon from "../ui/icons/crewai";
import DirectToLlmIcon from "../ui/icons/direct-to-llm";
import LanggraphIcon from "../ui/icons/langgraph";
import LlamaIndexIcon from "../ui/icons/llama-index";
import MastraIcon from "../ui/icons/mastra";
import AgnoIcon from "../ui/icons/agno";
import PydanticAiIcon from "../ui/icons/pydantic-ai";
import { MicrosoftIcon } from "../ui/icons/microsoft";
import { AwsStrandsIcon } from "../ui/icons/aws-strands";

// Icon mapping - component-specific
const INTEGRATION_ICONS: Record<
  IntegrationId,
  ComponentType<{ className?: string }>
> = {
  a2a: A2AIcon,
  adk: AdkIcon,
  ag2: Ag2Icon,
  "agent-spec": AgentSpecMarkIcon,
  agno: AgnoIcon,
  "crewai-flows": CrewaiIcon,
  "crewai-crews": CrewaiIcon,
  "direct-to-llm": DirectToLlmIcon,
  langgraph: LanggraphIcon,
  llamaindex: LlamaIndexIcon,
  mastra: MastraIcon,
  "pydantic-ai": PydanticAiIcon,
  "microsoft-agent-framework": MicrosoftIcon,
  "aws-strands": AwsStrandsIcon,
};

interface Integration {
  id: IntegrationId;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  href: string;
}

// Build integrations list from canonical order
const INTEGRATIONS: Integration[] = INTEGRATION_ORDER.map((id) => {
  const meta = getIntegration(id);
  return {
    id,
    label: meta.label,
    Icon: INTEGRATION_ICONS[id],
    href: meta.href,
  };
});

interface IntegrationsGridProps {
  targetPage?: string;
  suppressDirectToLLM?: boolean;
}

const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({
  targetPage,
  suppressDirectToLLM = false,
}) => {
  const hasTargetPage = (
    integration: Integration,
    targetPage: string
  ): boolean => {
    if (!targetPage) {
      return true;
    }

    // Use auto-generated feature mapping
    return hasIntegrationFeature(integration.id, targetPage);
  };

  const getHref = (integration: Integration) => {
    if (!targetPage) {
      return integration.href;
    }

    // Special case: direct-to-llm has pages in /guides/ subdirectory
    if (integration.id === "direct-to-llm") {
      return `${integration.href}/guides/${targetPage}`;
    }

    // For all other frameworks, append the target page
    return `${integration.href}/${targetPage}`;
  };

  let filteredIntegrations = INTEGRATIONS;

  // Filter out Direct to LLM if suppressed
  if (suppressDirectToLLM) {
    filteredIntegrations = filteredIntegrations.filter(
      (integration) => integration.id !== "direct-to-llm"
    );
  }

  // Filter out integrations that don't have the target page
  if (targetPage) {
    filteredIntegrations = filteredIntegrations.filter((integration) =>
      hasTargetPage(integration, targetPage)
    );
  }

  // Desktop layout: use flex-wrap and calculate row positions dynamically
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const desktopItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [desktopRowPositions, setDesktopRowPositions] = useState<number[]>([]);
  const [desktopSvgHeight, setDesktopSvgHeight] = useState(0);

  // Tablet layout (@2xl to @4xl)
  const tabletContainerRef = useRef<HTMLDivElement>(null);
  const tabletItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [tabletRowPositions, setTabletRowPositions] = useState<number[]>([]);

  // Mobile layout (below @2xl)
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobileItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [mobileRowPositions, setMobileRowPositions] = useState<number[]>([]);

  useEffect(() => {
    const calculateRowPositions = () => {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        // --- Desktop calculation ---
        if (desktopContainerRef.current) {
          const containerRect =
            desktopContainerRef.current.getBoundingClientRect();
          setDesktopSvgHeight(containerRect.height);

          const rows = new Map<number, number[]>();
          filteredIntegrations.forEach((_, index) => {
            const item = desktopItemsRef.current[index];
            if (!item) return;
            const itemRect = item.getBoundingClientRect();
            const itemCenterY =
              (itemRect.top + itemRect.bottom) / 2 - containerRect.top;

            let foundRow = false;
            for (const [rowY, centers] of rows.entries()) {
              if (Math.abs(itemCenterY - rowY) < 5) {
                centers.push(itemCenterY);
                foundRow = true;
                break;
              }
            }
            if (!foundRow) rows.set(itemCenterY, [itemCenterY]);
          });

          const rowPositions = Array.from(rows.values())
            .map(
              (centers) => centers.reduce((a, b) => a + b, 0) / centers.length
            )
            .sort((a, b) => a - b);
          setDesktopRowPositions(rowPositions);
        }

        // --- Tablet calculation ---
        if (tabletContainerRef.current) {
          const containerRect =
            tabletContainerRef.current.getBoundingClientRect();
          const rows = new Map<number, number[]>();
          filteredIntegrations.forEach((_, index) => {
            const item = tabletItemsRef.current[index];
            if (!item) return;
            const itemRect = item.getBoundingClientRect();
            const itemCenterY =
              (itemRect.top + itemRect.bottom) / 2 - containerRect.top;

            let foundRow = false;
            for (const [rowY, centers] of rows.entries()) {
              if (Math.abs(itemCenterY - rowY) < 5) {
                centers.push(itemCenterY);
                foundRow = true;
                break;
              }
            }
            if (!foundRow) rows.set(itemCenterY, [itemCenterY]);
          });

          const rowPositions = Array.from(rows.values())
            .map(
              (centers) => centers.reduce((a, b) => a + b, 0) / centers.length
            )
            .sort((a, b) => a - b);
          setTabletRowPositions(rowPositions);
        }

        // --- Mobile calculation ---
        if (mobileContainerRef.current) {
          const containerRect =
            mobileContainerRef.current.getBoundingClientRect();
          const rows = new Map<number, number[]>();
          filteredIntegrations.forEach((_, index) => {
            const item = mobileItemsRef.current[index];
            if (!item) return;
            const itemRect = item.getBoundingClientRect();
            const itemCenterY =
              (itemRect.top + itemRect.bottom) / 2 - containerRect.top;

            let foundRow = false;
            for (const [rowY, centers] of rows.entries()) {
              if (Math.abs(itemCenterY - rowY) < 5) {
                centers.push(itemCenterY);
                foundRow = true;
                break;
              }
            }
            if (!foundRow) rows.set(itemCenterY, [itemCenterY]);
          });

          const rowPositions = Array.from(rows.values())
            .map(
              (centers) => centers.reduce((a, b) => a + b, 0) / centers.length
            )
            .sort((a, b) => a - b);
          setMobileRowPositions(rowPositions);
        }
      });
    };

    calculateRowPositions();

    window.addEventListener("resize", calculateRowPositions);
    const resizeObserver = new ResizeObserver(() => {
      calculateRowPositions();
    });

    if (desktopContainerRef.current)
      resizeObserver.observe(desktopContainerRef.current);
    if (tabletContainerRef.current)
      resizeObserver.observe(tabletContainerRef.current);
    if (mobileContainerRef.current)
      resizeObserver.observe(mobileContainerRef.current);

    return () => {
      window.removeEventListener("resize", calculateRowPositions);
      resizeObserver.disconnect();
    };
  }, [filteredIntegrations]);

  return (
    <div className="@container flex flex-row flex-wrap justify-center items-center gap-x-6 gap-y-6 my-8">
      {/* Large desktop: flex-wrap layout (@4xl+) */}
      <div
        ref={desktopContainerRef}
        className="hidden @4xl:flex items-center gap-x-4 gap-y-2"
      >
        {/* Kite icon - positioned separately to avoid SVG distortion */}
        <div className="relative flex items-center shrink-0 -ml-6">
          <KiteIconLight className="block dark:hidden w-[120px] h-[120px]" />
          <KiteIconDark className="hidden dark:block w-[120px] h-[120px]" />
        </div>
        {/* Connectors SVG - overlaps with kite to attach to circle edge */}
        {desktopRowPositions.length > 0 && desktopSvgHeight > 0 && (
          <div className="-ml-[40px] shrink-0">
            <IntegrationsSelectorLightDesktop
              className="block dark:hidden"
              rowPositions={desktopRowPositions}
              svgHeight={desktopSvgHeight}
            />
            <IntegrationsSelectorDarkDesktop
              className="hidden dark:block"
              rowPositions={desktopRowPositions}
              svgHeight={desktopSvgHeight}
            />
          </div>
        )}
        <div
          className="flex flex-wrap gap-2 -ml-2"
          style={{ width: "fit-content" }}
        >
          {filteredIntegrations.map((integration, index) => (
            <div
              key={integration.id}
              ref={(el) => {
                desktopItemsRef.current[index] = el;
              }}
            >
              <IntegrationLinkRoundedButton
                label={integration.label}
                Icon={integration.Icon}
                href={getHref(integration)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Mobile screens (below @2xl): flex-wrap layout */}
      <div
        className="flex flex-row items-start gap-2 @2xl:hidden"
        ref={mobileContainerRef}
      >
        <div className="-ml-6 -mt-2.5 shrink-0">
          <IntegrationsSelectorLightMobile
            className="block dark:hidden"
            rowHeight={36}
            rowPositions={mobileRowPositions}
          />
          <IntegrationsSelectorDarkMobile
            className="hidden dark:block"
            rowHeight={36}
            rowPositions={mobileRowPositions}
          />
        </div>
        <div
          className="flex flex-wrap gap-2 -ml-8 mt-1 pt-[90px]"
          style={{ width: "fit-content", maxWidth: "100%" }}
        >
          {filteredIntegrations.map((integration, index) => (
            <div
              key={integration.id}
              ref={(el) => {
                mobileItemsRef.current[index] = el;
              }}
            >
              <IntegrationLinkRoundedButton
                label={integration.label}
                Icon={integration.Icon}
                href={getHref(integration)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Tablet screens (@2xl to @4xl): flex-wrap layout */}
      <div
        className="hidden @2xl:flex @4xl:hidden flex-row items-start gap-2"
        ref={tabletContainerRef}
      >
        <div className="-ml-7 -mt-2.5 shrink-0">
          <IntegrationsSelectorLightMobile
            className="block dark:hidden"
            rowHeight={60}
            rowPositions={tabletRowPositions}
          />
          <IntegrationsSelectorDarkMobile
            className="hidden dark:block"
            rowHeight={60}
            rowPositions={tabletRowPositions}
          />
        </div>
        <div
          className="flex flex-wrap gap-2 -ml-7 pt-[90px]"
          style={{ width: "fit-content", maxWidth: "100%" }}
        >
          {filteredIntegrations.map((integration, index) => (
            <div
              key={integration.id}
              ref={(el) => {
                tabletItemsRef.current[index] = el;
              }}
            >
              <IntegrationLinkRoundedButton
                label={integration.label}
                Icon={integration.Icon}
                href={getHref(integration)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { IntegrationsGrid };
export type { IntegrationsGridProps };
