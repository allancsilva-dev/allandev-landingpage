"use client";

import Image from "next/image";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { useState } from "react";

export type ProjectMission = {
  slug: string;
  title: string;
  summary: string;
  label: string;
  role: string;
  stack: string[];
  variant: "nexos" | "renowa";
};

export function ProjectSelect({ projects }: { projects: ProjectMission[] }) {
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? "");
  const selected =
    projects.find((project) => project.slug === selectedSlug) ?? projects[0];

  if (!selected) return null;

  return (
    <div className="arcade-project-select">
      <div
        className="arcade-mission-tabs"
        role="group"
        aria-label="Selecionar projeto em preparação"
      >
        {projects.map((project, index) => (
          <button
            type="button"
            className={project.slug === selected.slug ? "is-active" : ""}
            aria-pressed={project.slug === selected.slug}
            onClick={() => setSelectedSlug(project.slug)}
            key={project.slug}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {project.title}
            <LockKeyhole size={15} aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className={`arcade-mission-preview mission-${selected.variant}`}>
        <div className="arcade-cartridge" aria-hidden="true">
          {selected.variant === "nexos" ? (
            <Image
              src="/images/nexos-tech-logo.png"
              width={1024}
              height={1024}
              sizes="(max-width: 767px) 70vw, 360px"
              alt=""
            />
          ) : (
            <span>RENOWA</span>
          )}
          <i />
        </div>

        <div className="arcade-mission-copy" aria-live="polite">
          <p className="arcade-mission-state">
            <LockKeyhole size={15} aria-hidden="true" /> {selected.label}
          </p>
          <h3>{selected.title}</h3>
          <p>{selected.summary}</p>
          <dl>
            <div>
              <dt>FUNÇÃO</dt>
              <dd>{selected.role}</dd>
            </div>
            <div>
              <dt>STACK</dt>
              <dd>{selected.stack.join(" · ")}</dd>
            </div>
          </dl>
          <a className="arcade-button arcade-button-primary" href="#contato">
            PEDIR APRESENTAÇÃO <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
