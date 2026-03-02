<script lang="ts">
import { enhance } from '$app/forms';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();
let loading = $state(false);
</script>

<svelte:head>
<title>NewsDesk — Sign In</title>
</svelte:head>

<div class="login-screen">
<div class="login-form-container">
<div class="logo-handler">
<div class="logo-wordmark">NewsDesk</div>
</div>

<div class="form-handler">
{#if form?.error}
<div class="error-handler">
<p class="error">{form.error}</p>
</div>
{/if}

<form
method="POST"
action="?/login"
use:enhance={() => {
loading = true;
return async ({ update }) => {
await update({ reset: false });
loading = false;
};
}}
>
<fieldset class="inputs">
<input
type="text"
name="username"
placeholder="username"
class="fullwidth-input"
autocomplete="username"
required
disabled={loading}
/>
<input
type="password"
name="password"
placeholder="password"
class="fullwidth-input"
autocomplete="current-password"
required
disabled={loading}
/>
</fieldset>

<fieldset class="buttons">
<button type="submit" class="btn-login" disabled={loading}>
{#if loading}
<span class="spinner">
<span class="dot1"></span>
<span class="dot2"></span>
</span>
{:else}
Log In
{/if}
</button>
</fieldset>
</form>

<div class="links">
<a href="/register" class="link-text">Don't have an account? Register</a>
</div>
</div>
</div>
</div>

<style>
.login-screen {
position: fixed;
inset: 0;
background-color: #1b1b1b;
z-index: 100;
display: flex;
align-items: center;
justify-content: center;
}

.login-form-container {
width: 320px;
padding: 0 15px;
padding-top: 60px;
}

.logo-handler {
margin-bottom: 60px;
text-align: center;
}

.logo-wordmark {
font-size: 2.25rem;
font-weight: 800;
letter-spacing: -0.05em;
color: #fff;
font-family: system-ui, -apple-system, sans-serif;
}

.form-handler {
display: flex;
flex-direction: column;
gap: 0;
}

.error-handler {
margin-bottom: 1rem;
}

.error {
color: #f87171;
font-size: 0.875rem;
text-align: center;
padding: 0.5rem 0.75rem;
background: rgba(239, 68, 68, 0.1);
border: 1px solid rgba(239, 68, 68, 0.3);
border-radius: 3px;
margin: 0;
}

.inputs {
border: none;
padding: 0;
margin: 0 0 1rem 0;
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.fullwidth-input {
width: 100%;
box-sizing: border-box;
background: #2b2b2b;
border: 1px solid #404040;
border-radius: 3px;
color: #e0e0e0;
font-size: 0.9375rem;
padding: 0.625rem 0.875rem;
outline: none;
transition:
border-color 0.15s ease,
box-shadow 0.15s ease;
}

.fullwidth-input::placeholder {
color: #6b6b6b;
}

.fullwidth-input:focus {
border-color: #5da0c8;
box-shadow: 0 0 0 2px rgba(93, 160, 200, 0.2);
}

.fullwidth-input:disabled {
opacity: 0.6;
cursor: not-allowed;
}

.buttons {
border: none;
padding: 0;
margin: 0 0 1.25rem 0;
}

.btn-login {
width: 100%;
padding: 0.6875rem 1rem;
background: #5da0c8;
color: #fff;
font-size: 0.9375rem;
font-weight: 600;
border: none;
border-radius: 3px;
cursor: pointer;
transition: background 0.15s ease;
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
min-height: 2.75rem;
}

.btn-login:hover:not(:disabled) {
background: #4a8cb0;
}

.btn-login:active:not(:disabled) {
background: #3d7a9a;
}

.btn-login:disabled {
opacity: 0.7;
cursor: not-allowed;
}

.links {
text-align: center;
}

.link-text {
color: #6b9fc4;
font-size: 0.8125rem;
text-decoration: none;
transition: color 0.15s ease;
}

.link-text:hover {
color: #5da0c8;
text-decoration: underline;
}

/* Loading spinner */
.spinner {
display: inline-flex;
align-items: center;
gap: 4px;
}

.dot1,
.dot2 {
width: 6px;
height: 6px;
background: #fff;
border-radius: 50%;
animation: bounce 1s infinite;
}

.dot2 {
animation-delay: 0.15s;
}

@keyframes bounce {
0%, 100% { opacity: 0.3; transform: scale(0.8); }
50% { opacity: 1; transform: scale(1); }
}
</style>
