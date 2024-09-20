import React from 'react'

const Usage = ({ onClose }: { onClose: () => void }) => {
    const url = window.location.href;
    return (
        <>
            <dialog open className={`bg-transparent flex justify-center ${url.includes("linkedin") ? "w-3/5" : ""}`}>
                <div className={`flex flex-col ${url.includes("linkedin") ? "w-[450px] p-[20px]" : "max-w-md"} gap-2 p-6 rounded-md shadow-md bg-gray-50 text-gray-800`}>
                    <h2 className={`${url.includes("linkedin") ? "text-3xl" : "text-xl"} font-semibold leading-tight tracking-wide`}>How to use Jobbin</h2>
                    <div className='divide-y divide-gray-200 h-0.5 bg-gray-200'></div>
                    <p className="flex-1 text-gray-600">Use this extension to easily track your job applications. For select websites, a pop-up will show once you apply to a job, which you can use to add to your applications (viewable when you click on "View applications").<br /><br /> If you have available credits in OpenAI or Anthropic, use your API Key in the input. It is of course, optional. Once you apply for a job, AI will parse the job details and identify the role, company, etc. saving your lazy ass a few seconds (it may not always be accurate).</p>
                    <div className="flex flex-col justify-end gap-6 mt-6 sm:flex-row">
                        {/* <div className="flex items-center gap-2">
                            <input type="checkbox" name="showAgain" id="showAgain" className="rounded-sm focus:ring-violet-600 focus:border-violet-600 focus:ring-2 accent-violet-600" />
                            <label htmlFor="showAgain" className="text-sm cursor-pointer text-gray-600">Don't show this again</label>
                        </div> */}
                        <button onClick={onClose} className={`cursor-pointer px-6 py-2 rounded-md shadow-sm text-gray-800 bg-gray-200 hover:bg-violet-400 hover:text-white focus:bg-violet-600 focus:text-white ${url.includes("linkedin") ? "h-[42px]" : ""}`}>Um... Sure</button>
                    </div>
                </div>
            </dialog>
        </>
    )
}

export default Usage