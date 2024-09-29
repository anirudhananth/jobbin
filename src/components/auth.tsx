import { FormEvent, useState } from "react"

export default function Auth({ signUp, login, invalidCredentials }: { signUp: (firstName: string, lastName: string, email: string, password: string) => void, login: (email: string, password: string) => void, invalidCredentials: boolean }) {
    const [isSignUp, setIsSignUp] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isWrongPassword, setIsWrongPassword] = useState(false)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (isSignUp) {
            if (password !== confirmPassword) {
                setIsWrongPassword(true)
                return
            }
            setIsWrongPassword(false)
            signUp(firstName, lastName, email, password)
        } else {
            login(email, password)
        }
    }

    return (
        <div className="p-2 bg-white text-gray-900">
            <div className="grid grid-cols-2 px-4 overflow-hidden sm:justify-center flex-wrap bg-gray-50 dark:bg-gray-50">
                <a rel="noopener noreferrer" href="#" onClick={(e) => setIsSignUp(true)} className={`text-center flex-shrink-0 px-5 py-2 border-b-4 ${isSignUp ? "border-violet-600 text-gray-900" : "border-gray-300 text-gray-600"}`}>Sign up</a>
                <a rel="noopener noreferrer" href="#" onClick={(e) => setIsSignUp(false)} className={`text-center flex-shrink-0 px-5 py-2 border-b-4 ${!isSignUp ? "border-violet-600 text-gray-900" : "border-gray-300 text-gray-600"}`}>Login</a>
            </div>
            <div className="pt-4 bg-gray-50 dark:bg-gray-50">
                <form onSubmit={handleSubmit} className="flex flex-col mx-auto space-y-12">
                    <fieldset className="grid grid-cols-1 gap-6 p-6 rounded-md shadow-sm">
                        <div className="space-y-2 col-span-full lg:col-span-1 mx-auto" >
                            <p className="text-2xl text-gray-800 font-semibold">{isSignUp ? "Create a new account!" : "Login to your account!"}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 col-span-full lg:col-span-3" >
                            {isSignUp && (
                                <>
                                    <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                                        <label htmlFor="FirstName" className={`text-sm italic px-1 font-bold text-gray-800`}>First Name</label>
                                        <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={`!w-full h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                                    </div>
                                    <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                                        <label htmlFor="LastName" className={`text-sm italic px-1 font-bold text-gray-800`}>Last Name</label>
                                        <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={`!w-full h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                                    </div>
                                </>
                            )}
                            <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                                <label htmlFor="Email" className={`text-sm italic px-1 font-bold text-gray-800`}>Email</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="xyz@gmail.com" className={`!w-full h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                            </div>
                            <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                                <label htmlFor="Password" className={`text-sm italic px-1 font-bold text-gray-800`}>Password</label>
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a password" className={`!w-full h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                            </div>
                            {isSignUp && (
                                <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                                    <label htmlFor="ConfirmPassword" className={`text-sm italic px-1 font-bold text-gray-800`}>Confirm Password</label>
                                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className={`!w-full h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                                    {isWrongPassword && <label htmlFor="WrongPassword" className={`text-xs px-1 font-bold text-red-500 dark:text-red-500`}>Passwords don't match!</label>}
                                </div>
                            )}
                            <button type="submit" className="px-8 py-3 font-semibold rounded bg-gray-800 text-gray-100 w-48 mx-auto hover:bg-violet-400 focus:bg-violet-600">{isSignUp ? "SIGN UP" : "LOGIN"}</button>
                            {!isSignUp && invalidCredentials && (
                                <div className="w-full text-center">
                                    <label htmlFor="InvalidCredentials" className={`text-sm px-1 font-bold text-red-600`}>
                                        Invalid credentials.
                                    </label>
                                </div>
                            )}
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    )
}