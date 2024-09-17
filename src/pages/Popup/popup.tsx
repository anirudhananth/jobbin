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
    })
  }

  return (
    <div className="">
      {/* <Job /> */}
      {!isSignedIn ? (
        <Auth
          signUp={(firstName, lastName, email, password) => signUp(firstName, lastName, email, password)}
          login={(email, password) => login(email, password)}
        />
      ) : (
        <Main />
      )}
    </div>
  );
}

export default React.memo(Popup);