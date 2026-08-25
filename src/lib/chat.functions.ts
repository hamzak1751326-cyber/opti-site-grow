import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const input=z.object({message:z.string().trim().min(1).max(2000),auditId:z.string().uuid().optional()});
const windows=new Map<string,{started:number;count:number}>();
const LIMIT=20; const WINDOW=10*60*1000;
export const askChatbot=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((value:unknown)=>input.parse(value)).handler(async({data,context})=>{
 const now=Date.now(); const prior=windows.get(context.userId); if(!prior||now-prior.started>=WINDOW) windows.set(context.userId,{started:now,count:1}); else {if(prior.count>=LIMIT) throw new Error("Chat limit reached. Please try again later."); prior.count+=1;}
 let auditContext="No audit was selected.";
 if(data.auditId){const audit=await context.supabase.from("audits").select("url,page_title,status,overall_score,seo_score,performance_score,security_score,accessibility_score,summary").eq("id",data.auditId).maybeSingle(); if(audit.error) throw new Error("Could not load that audit."); if(!audit.data) throw new Error("Audit not found."); const results=await context.supabase.from("audit_results").select("category,score,summary,findings").eq("audit_id",data.auditId); auditContext=JSON.stringify({audit:audit.data,results:results.data||[]});}
 const apiKey=process.env["LOVABLE_API_KEY"]; if(!apiKey) throw new Error("The AI assistant is not configured.");
 const gateway=createLovableAiGatewayProvider(apiKey);
 const result=await generateText({model:gateway("openai/gpt-5.6-sol"),system:"You are OptiSite AI's product assistant. Explain how to use audits, reports, competitors, invoices, SEO, performance, accessibility, UX, and security recommendations. Use the supplied audit evidence when present. Be concise, practical, and honest about uncertainty. Never give legal, tax, financial, medical, or professional cybersecurity advice. Do not claim compliance, certification, rankings, or guaranteed outcomes. Say when evidence is missing. Do not request secrets, passwords, API keys, or unnecessary personal data.",prompt:"Audit context:\n"+auditContext+"\n\nUser question:\n"+data.message});
 return {answer:result.text};
});
