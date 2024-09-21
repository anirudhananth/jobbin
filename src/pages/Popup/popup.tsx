import Job from "../../components/job";
import { createClient, User } from "@supabase/supabase-js";
import Auth from "../../components/auth";
import "../../index.css";
import { useState, useEffect } from "react";
import React from "react";
import Main from "../../components/main";

const supabaseUrl = 'https://ykcecftnsyyclchogssh.supabase.co';

function Popup() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
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
    chrome.storage.local.get(['supabaseKey', 'user'], (result) => {
      const supabaseKey = result.supabaseKey;
      console.log("hi")
      const supabaseClient = createClient(supabaseUrl, supabaseKey);
      setSupabase(supabaseClient);

      if (result.user) {
        setUser(result.user);
        setIsSignedIn(true);
      }
    })
  }, []);

  async function signUp(firstName: string, lastName: string, email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://eeikkhebkpoeajjjdhnnnhpgdnepgghc.chromiumapp.org/',
        }
      })

      if (error) {
        console.error('Error signing in:', error);
      } else {
        console.log('Signed in successfully:', data);
        await supabase.from('users').insert({
          id: data.user?.id,
          first_name: firstName,
          last_name: lastName,
          email,
        }).catch((error: Error) => {
          console.error('Error inserting user:', error);
          return;
        });
        setUser(data.user);
        setIsSignedIn(true);
        chrome.storage.local.set({
          user: {
            ...data.user,
            firstName,
            lastName
          }
        });
        // Handle successful sign-in (e.g., update UI, store session)
      }
    } catch (error) {
      console.error('Error during Supabase sign-in:', error);
    }
  }

  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Error signing in:', error);
      } else {
        console.log('Signed in successfully:', data);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user?.id)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        setUser(data.user);
        setIsSignedIn(true);
        chrome.storage.local.set({
          user: {
            ...data.user,
            firstName: userData.first_name,
            lastName: userData.last_name
          }
        });
        // Handle successful sign-in (e.g., update UI, store session)
      }
    } catch (error) {
      console.error('Error during Supabase sign-in:', error);
    }
  }

  function signOut() {
    supabase.auth.signOut().then(() => {
      setUser(null);
      setIsSignedIn(false);
      chrome.storage.local.remove('user');
      chrome.storage.local.set({ openaiApiKey: '' });
      chrome.storage.local.set({ anthropicApiKey: '' });
      chrome.storage.local.set({ apiProvider: '' });
      chrome.storage.local.set({ disabled: false });
    })
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
        {/* <Job /> */}
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