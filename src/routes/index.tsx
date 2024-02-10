import {$, component$, useSignal, } from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import {server$} from "@builder.io/qwik-city";

export const getLastPartOfUrl = $((url:string) => {
  const segments = url.split('/');
  return segments[segments.length - 1];
})

export default component$(() => {
  const paymentLink = useSignal("")
  const redirect = useSignal("#")


  const getRedirectURL = server$(async (final) => {
    const lastPart = await getLastPartOfUrl(final)
    console.log(lastPart)
    const res = await fetch(`https://merchant-ui-api.stripe.com/payment-links/${lastPart}`, {
      method: "POST",
    })
    const jsonn = await res.json()
    return jsonn.completion_behavior.redirect_url
  })

  return (
    <>
      <div>
        <form class={"flex items-center justify-center mx-4 mt-6 "} preventdefault:submit onSubmit$={ async () => {
          redirect.value = "Fetching..."
          redirect.value = await getRedirectURL(paymentLink.value)
        }}>
          <input class={"w-2/3 py-2.5"} type="text" placeholder={"Paste the stripe payment link here"} onInput$={(e) => {
            paymentLink.value = (e.target as HTMLInputElement).value
          }}/>
          <input type="submit" class={"w-1/3"}/>
        </form>
      </div>
      <div class={"mx-4 mt-2"}>
        <p class={"mb-8 text-gray-300 font-light"}>The redirect url will appear underneath. Feel free to click it or copy it.</p>
        <p class={"font-light"}>The redirect url:</p>
        <a class={"font-bold mt-1"} href={redirect.value}>{redirect.value}</a>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "RedirectURL - Stripe payment link",
  meta: [
    {
      name: "description",
      content: "Get the redirect url of any stripe checkout link",
    },
  ],
};
