# PulseMotion TV — Submission Checklist

**Build, Ship, Shape: Amazon Developer Hackathon · Fire TV Track**

Every rule quoted below was retrieved on **2026-09-18** from the official hackathon pages:
<https://amazonappdev2026.devpost.com/rules> and <https://amazonappdev2026.devpost.com/>.
Quotes are verbatim; the status column is this project's own honest self-assessment.

Legend: ✅ satisfied by this repository · ⚠️ cannot be satisfied by the repository alone (must be done on camera or in the Devpost form) · ❌ not claimed

---

## 1. Primary track — Fire TV

| Rule (quoted verbatim)                                                                                                                                                          | Status | Where                                                                                             |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----: | :------------------------------------------------------------------------------------------------ |
| "Fire TV: Eligible projects for this category have to launch a demo-ready app that works on Fire OS or Vega OS."                                                                |   ✅   | Hosted / packaged Fire TV Web App on **Fire OS 8** — see [`firetv/README.md`](./firetv/README.md) |
| "Fire TV: Any framework or language is acceptable (React Native, Android/Kotlin/Java, web technologies, etc.). The requirement is that the project runs on Fire OS or Vega OS." |   ✅   | React 19 + TypeScript + Vite 6 web build — no Kotlin/React Native rewrite needed                  |
| "The demo video must show the project running on an actual Fire TV device or the Fire TV/Vega simulator."                                                                       |   ⚠️   | **binary requirement, video only**                                                                |
| "For Alexa+, Bee, and Ring: the repository must demonstrate use of your track's required technology at runtime in your code… **Fire TV is the exception** see below."           |   ✅   | no Fire TV SDK import is required for this track                                                  |
| Priority categories: "AI-enhanced viewing, sports, fitness, family entertainment, multi-modal UX, and computer vision."                                                         |   ✅   | on-device pose estimation + fitness coaching + voice = computer vision + multi-modal UX           |

## 2. Repository requirements

| Rule (quoted verbatim)                                                                                                                                            |  Status  | Where                                                                                                                                                                                     |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The repository must contain all necessary source code, assets, and instructions required for the project to be functional."                                      |    ✅    | this repository                                                                                                                                                                           |
| "The repository must be either public and open source by including an open source license file OR private and shared with testing@devpost.com and @AmazonAppDev." |    ✅    | public repo + [`LICENSE`](./LICENSE) (MIT, `Copyright (c) 2026 Adam Babinicz`)                                                                                                            |
| "The Project's code repository must include clear setup and run instructions."                                                                                    |    ✅    | README → Quick Start (`pnpm install` / `pnpm dev` / `pnpm build`), Scripts Reference, `firetv/README.md`                                                                                  |
| "All Submission materials (demo video, written description, and code documentation) must be in English…"                                                          |    ✅    | README, `firetv/README.md` and this file are in English. `CHANGELOG-COMPATIBILITY.md` is an author-facing Polish change log; this file is its English equivalent for evaluation purposes. |
| "If your project existed before the hackathon, a clear explanation of what you built or changed during the submission window."                                    | ✅ (n/a) | public repo history starts inside the Submission Period — see the commit table in the README                                                                                              |

## 3. Demo video — check before uploading

| Rule (quoted verbatim)                                                                                                                    | Status |
| :---------------------------------------------------------------------------------------------------------------------------------------- | :----: |
| "should be less than three (3) minutes. Judges are not required to watch beyond three minutes"                                            |   ⚠️   |
| "should include footage that shows the Project functioning on the device for which it was built"                                          |   ⚠️   |
| "must be uploaded to and made publicly visible on YouTube or Vimeo"                                                                       |   ⚠️   |
| "must not include third party trademarks, or copyrighted music or other material unless the Entrant has permission to use such material." |   ⚠️   |

Suggested shot list: (1) Fire TV on the TV, Web App Tester → Hosted Apps → Test App; (2) D-Pad navigation through the exercise carousel; (3) a pose-tracked set with live rep counter and voice coach; (4) the camera-less path — camera denied → focus jumps to the simulator → workout still runs.

## 4. Product feedback — ⚠️ must be written into the Devpost form

From the rules: "Product feedback on every tool, API, or SDK you used: what you used it for, what worked well, what needs work, how onboarding felt, and whether you'd build with it again."
The repo's own tool-level notes live in the Friction Log section of the README; they are **not** a substitute for the Devpost field.

## 5. Friction log — optional, eligible for up to a 10% judging bonus

From the rules: "Submissions with friction logs can earn up to a 10% judging bonus." and "During Stage 1 downselection, Amazon's internal review team assesses each submission's friction log entries… and passes a recommended bonus up to 10% to the Stage 2 judging panel."
🟡 The five entries in the README map 1:1 onto the required fields (task attempted, steps taken, expected vs. actual, severity, workaround, suggestion). **Paste them into the Devpost form as well** — the bonus is assessed from the submission, not from the repository.

## 6. Mini challenges — status

| Mini challenge  | Rule (quoted verbatim)                                                                                                                                             |                                                             Status                                                              |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------------------------------------------------------------------------------------: |
| **AWS Builder** | "Any primary track project that incorporates AWS services (i.e. Amazon Bedrock, AgentCore, Strands SDK, Kiro Crew, SageMaker, etc.) with documented integrations." |                          ❌ **not claimed** — no AWS service and no Kiro Crew is used in this project                           |
| **Open Source** | "Create a new, additional open-source project or contribute to an existing public repository during the hackathon window, alongside a primary track submission."   | ❌ **not claimed** — an MIT license on this repo does not qualify; a separate new project, branch, fork or PR would be required |

## 7. Submission period

From the rules: "Submission Period: Monday, August 31, 2026 (10:15 am Pacific Time) – Friday, October 23, 2026 (12:00 pm Pacific Time)."

## 8. Judging criteria (equally weighted, per the rules)

"Tech Implementation" · "Design" · "Potential Impact" · "Quality of the Idea". Fire TV is scored on a demo-ready app that runs on Fire OS or Vega OS, with the demo video carrying the burden of proof for the platform requirement.

## 9. Open items that live outside this repository

1. **Demo video** showing the app running on a Fire TV device or the Fire TV/Vega simulator, under 3 minutes, public on YouTube or Vimeo.
2. **Product feedback** and **friction log** pasted into the Devpost form.
3. **Devpost form fields**: primary track = Fire TV; mini challenges left unticked unless the situation changes.

## 10. Known limitations (stated deliberately)

- The published pipeline figures (31.4 ms end-to-end, 58–60 FPS) are **dev-phase measurements** on a Fire TV Stick 4K Max. The repository ships **no benchmark harness** and nothing is reproduced in CI — they are not guarantees.
- The Cordova hybrid configuration in [`cordova/config.xml`](./cordova/config.xml) is **experimental**: `cordova build android` has never been run, and it is not device-verified.
- PulseMotion TV is **not** published in the Amazon Appstore; the Amazon Web App Tester is a testing path, not a distribution channel.
