import { newEnforcer, newModelFromString, StringAdapter } from 'casbin';
import type { Enforcer } from 'casbin';

// ─── Casbin RBAC Model ───────────────────────────────────────────────────────
const MODEL = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && keyMatch2(r.obj, p.obj) && (r.act == p.act || p.act == "*")
`;

// ─── Casbin Policy ────────────────────────────────────────────────────────────
// Role hierarchy
// admin → editor → journalist
const POLICY = `
p, journalist, articles, create
p, journalist, articles, read
p, journalist, articles, update
p, journalist, media, read

p, editor, articles, publish
p, editor, articles, delete
p, editor, media, create
p, editor, media, delete
p, editor, settings, read
p, editor, desk, manage

p, admin, settings, manage
p, admin, users, manage
p, admin, users, read
p, admin, *, *

g, editor, journalist
g, admin, editor
`;

// ─── Singleton ────────────────────────────────────────────────────────────────
let _enforcer: Enforcer | null = null;

export async function getEnforcer(): Promise<Enforcer> {
	if (_enforcer) return _enforcer;

	const model = await newModelFromString(MODEL);
	const adapter = new StringAdapter(POLICY);
	_enforcer = await newEnforcer(model, adapter);
	return _enforcer;
}

// ─── Permission check helper ──────────────────────────────────────────────────
export async function can(
	role: string | null | undefined,
	resource: string,
	action: string
): Promise<boolean> {
	if (!role) return false;
	const enforcer = await getEnforcer();
	return enforcer.enforce(role, resource, action);
}

// ─── Role definitions ─────────────────────────────────────────────────────────
export const ROLES = ['admin', 'editor', 'journalist', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export function isValidRole(role: string): role is Role {
	return ROLES.includes(role as Role);
}
