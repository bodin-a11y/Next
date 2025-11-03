import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  title: string;
  desc?: string;
  icon?: React.ReactNode;
};

export default function HomeCard({ href, title, desc, icon }: Props) {
  return (
    <Link href={href} className="card">
      <div className="card-inner">
        <div className="card-icon">{icon}</div>
        <h3 className="card-title">{title}</h3>
        {desc ? <p className="card-desc">{desc}</p> : null}
      </div>
    </Link>
  );
}
