import Job from "../../components/job";
import { User } from "@supabase/supabase-js";
import Auth from "../../components/auth";
import "../../index.css";
import { useState, useEffect } from "react";
import React from "react";
import Main from "../../components/main";

const JOBBIN_SERVER_URL = "https://jobbin-server.vercel.app";


function Popup() {
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [isAllowed, setIsAllowed] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [invalidCredentials, setInvalidCredentials] = useState(false);
	const [userExists, setUserExists] = useState(false);
	const allowedDomains: string[] = [
		"indeed.com",
		"linkedin.com",
		"glassdoor.com",
		"monster.com",
		"careerbuilder.com",
		"simplyhired.com",
		"ziprecruiter.com",
		"dice.com",
		"angel.co",
		"wellfound.com",
		"myworkdayjobs.com"
	]

	async function isAllowedURL(): Promise<void> {
		try {
			const url = await getUrl();
			if (!url) {
				setIsAllowed(false);
				setIsLoading(false);
				return;
			}
			console.log("URL:", url);
			const urlObject = new URL(url);
			const domain = urlObject.hostname.toLowerCase();
			console.log("Domain:", domain);
			setIsAllowed(allowedDomains.some(allowedDomain =>
				domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
			));
			setIsLoading(false);
		} catch (error) {
			console.error("Invalid URL.");
			return;
		}
	}

	async function getUrl(): Promise<string | undefined> {
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!tabs || !tabs[0] || !tabs[0].url) {
			return undefined;
		}
		return tabs[0].url;
	}

	useEffect(() => {
		isAllowedURL();
	}, []);

	useEffect(() => {
		chrome.storage.local.get(['user'], (result) => {
			if (result.user) {
				setUser(result.user);
				setIsSignedIn(true);
			}
		})
	}, []);

	async function signUp(firstName: string, lastName: string, email: string, password: string) {
		try {
			setUserExists(false);
			const response = await fetch(`${JOBBIN_SERVER_URL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					password
				})
			});

			if (!response.ok) {
				console.log("Error signing up:", response);
				const errorResponse = await response.json();
				if (errorResponse.error.code === "user_already_exists") {
					setUserExists(true);
					return;
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const res = await response.json();
			setUser(res.data.user);
			setIsSignedIn(true);
			chrome.storage.local.set({
				user: {
					...res.data.user,
					firstName,
					lastName
				}
			});
		} catch (error) {
			console.error('Error during Supabase sign-in:', error);
		}
	}

	async function login(email: string, password: string) {
		try {
			setInvalidCredentials(false);
			const response = await fetch(`${JOBBIN_SERVER_URL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password
				})
			});

			if (!response.ok) {
				const errorResponse = await response.json();
				if (errorResponse.error.code === "invalid_credentials") {
					setInvalidCredentials(true);
					return;
				} else {
					throw new Error(errorResponse.error.code || "Login failed");
				}
			}

			const data = await response.json();
			setUser(data.user);
			setIsSignedIn(true);
			chrome.storage.local.set({
				user: {
					...data.user,
					firstName: data.firstName,
					lastName: data.lastName
				}
			});
		} catch (error) {
			console.error("Error while signing in:", error);
		}
	}

	async function signOut() {
		try {
			const response = await fetch(`${JOBBIN_SERVER_URL}/logout`);
			if (!response.ok) {
				console.log("Error logging out:", response);
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			setUser(null);
			setIsSignedIn(false);
			chrome.storage.local.remove('user');
			chrome.storage.local.set({ openaiApiKey: '' });
			chrome.storage.local.set({ anthropicApiKey: '' });
			chrome.storage.local.set({ apiProvider: '' });
			chrome.storage.local.set({ disabled: false });
		} catch (error) {
			console.error('Error during Supabase sign-out:', error);
		}
	}

	return (
		<>
			<style>
				{
					`.loader-container {
						display: flex;
						justify-content: center;
						align-items: center;
						height: 100%;
						width: 100%;
					}

					.loader {
						border: 4px solid #f3f3f3;
						border-top: 4px solid #3498db;
						border-radius: 50%;
						width: 40px;
						height: 40px;
						animation: spin 1s linear infinite;
					}

					@keyframes spin {
						0% { transform: rotate(0deg); }
						100% { transform: rotate(360deg); }
					}`
				}
			</style>
			<div className="">
				{isLoading ? (
					<div className="loader-container">
						<div className="loader"></div>
					</div>
				) : (
					isAllowed === true ? (
						!isSignedIn ? (
							<Auth
								signUp={(firstName, lastName, email, password) => signUp(firstName, lastName, email, password)}
								login={(email, password) => login(email, password)}
								invalidCredentials={invalidCredentials}
								userExists={userExists}
							/>
						) : (
							<Main
								signOut={() => signOut()}
							/>
						)
					) : (
						<div className="bg-gray-100 p-5 m-4 text-left font-bold text-lg text-gray-800 rounded-lg"><span className="text-3xl text-violet-500">Oops!</span><br /> Jobbin is not<br /> supported on this page.</div>
					)
				)
				}
			</div>
		</>
	)
}

export default React.memo(Popup);