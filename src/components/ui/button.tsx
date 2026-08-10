import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Base = {
  variant?: "primary" | "secondary";
};

type AsButton = Base &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };
type AsLink = Base &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", ...rest } = props;
  const cls = `button button-${variant}`;
  if (rest.href !== undefined) return <a className={cls} {...rest} />;
  return <button className={cls} type="button" {...(rest as AsButton)} />;
}
