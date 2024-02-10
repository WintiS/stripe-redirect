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
        <form preventdefault:submit onSubmit$={ async () => {
          redirect.value = "Fetching..."
          redirect.value = await getRedirectURL(paymentLink.value)
        }}>
          <input type="text" placeholder={"Paste the stripe payment link here"} onInput$={(e) => {
            paymentLink.value = (e.target as HTMLInputElement).value
          }}/>
          <input type="submit"/>
        </form>
      </div>
      <div>
        <h2>The redirect url will appear underneath. Feel free to click it or copy it.</h2>
        <a href={redirect.value}>{redirect.value}</a>
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
