const emailStep = document.getElementById('email-step')
const codeStep = document.getElementById('code-step')
const signedInStep = document.getElementById('signed-in-step')
const emailInput = document.getElementById('email-input')
const codeInput = document.getElementById('code-input')
const statusEl = document.getElementById('status')
const userEmailEl = document.getElementById('user-email')

let pendingEmail = ''

async function render() {
  const session = await getValidSession()
  if (session) {
    emailStep.classList.add('hidden')
    codeStep.classList.add('hidden')
    signedInStep.classList.remove('hidden')
    userEmailEl.textContent = session.user.email
  } else {
    signedInStep.classList.add('hidden')
    codeStep.classList.add('hidden')
    emailStep.classList.remove('hidden')
  }
}

document.getElementById('send-code').addEventListener('click', async () => {
  pendingEmail = emailInput.value.trim()
  if (!pendingEmail) return
  statusEl.textContent = 'Sending code…'
  try {
    await requestCode(pendingEmail)
    emailStep.classList.add('hidden')
    codeStep.classList.remove('hidden')
    statusEl.textContent = ''
  } catch (e) {
    statusEl.textContent = e.message
  }
})

document.getElementById('verify-code').addEventListener('click', async () => {
  const token = codeInput.value.trim()
  if (!token) return
  statusEl.textContent = 'Verifying…'
  try {
    await verifyCode(pendingEmail, token)
    statusEl.textContent = ''
    render()
  } catch (e) {
    statusEl.textContent = e.message
  }
})

document.getElementById('sign-out').addEventListener('click', async () => {
  await clearSession()
  render()
})

render()
