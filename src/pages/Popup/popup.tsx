import Job from "../../components/job";
import { createClient, User } from "@supabase/supabase-js";
import Auth from "../../components/auth";
import "../../index.css";
import { useState, useEffect } from "react";
import React from "react";
import Main from "../../components/main";

const supabaseUrl = 'https://ykcecftnsyyclchogssh.supabase.co';

function Popup() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

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

  async function signUp(email: string, password: string) {
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
        setUser(data.user);
        setIsSignedIn(true);
        chrome.storage.local.set({ user: data.user });
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
        setUser(data.user);
        setIsSignedIn(true);
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
    })
  }

  return (
    <div className="">
      {/* <Job /> */}
      {!isSignedIn ? (
        <Auth
          signUp={(email, password) => signUp(email, password)}
          login={(email, password) => login(email, password)}
        />
      ) : (
        <Main />
      )}
    </div>
  );
}

export default React.memo(Popup);