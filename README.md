# quantum-crypto-illustrated

Illustrated study notes for Easttom's Quantum Cryptography course — RSA, DH, lattices, LWE, NTRU, Kyber and FrodoKEM worked with real numbers, one self-contained page with six live playgrounds.

**Live page:** <https://systemslibrarian.github.io/quantum-crypto-illustrated/>

## Live demos

Six of the figures are interactive:

| Lesson | Demo |
| --- | --- |
| 1 | RSA end to end — change p, q, e and the message and watch d, the ciphertext and the recovery follow |
| 1 | Diffie-Hellman — run the exchange, then brute-force the discrete log and see the attempt count |
| 4 | **Drag the CVP target** — Babai rounding against a good and a bad basis of the same lattice; the skewed one misses about four times in five |
| 4 | LWE — encrypt a bit against the published rows and decode it |
| 5 | NTRU — roll a fresh ternary key, recompute both inverses, watch the same three decryption steps land on m |
| 6 | Baby Kyber — encrypt any number 0–15, then widen the noise until decryption actually fails |

There is also a light/dark/system toggle, and the contents list marks which sections carry a demo.

## What's on the page

- **1 — The threat & the math RSA runs on.** Trapdoor arrows (easy forward, Shor backward), which families break, mod arithmetic on a clock and number line, φ(15) on a strip, the RSA pipeline with p = 17, q = 11 and a live playground, Diffie-Hellman as an exchange diagram.
- **2 — Math for quantum cryptography.** Venn quartet, injective/surjective/bijective maps, vectors and independence, group ⊂ ring ⊂ field, the truncated polynomial ring.
- **3 — Standards.** NIST map (ML-KEM, ML-DSA, SLH-DSA, FN-DSA, FIPS numbers, old names), CNSA 2.0 table.
- **4 — Lattices.** A draggable lattice: the same grid under a good and a bad basis, with Babai rounding run live against both, the problems table, LWE built in three stages from a self-consistent toy key with an encrypt-a-bit playground, the decoder dial, IND-CPA ⊂ CCA ⊂ CCA2, the CCA1/CCA2 timeline, why FO earns CCA2.
- **5 — NTRU.** Parameter cards, a fully worked keygen/encrypt/decrypt with N = 7, q = 41, p = 3 (every polynomial shown), and the algebra of why the p·r·g term vanishes.
- **6 — CRYSTALS.** Parameter-set table with real byte sizes, the "one ring, three k" module diagram, baby Kyber fully worked in ℤ₁₇[x]/(x⁴+1) encrypting 11 → 1011, the Fujisaki–Okamoto transform drawn, the NIST-round change timeline, side-channel vs algorithm.
- **7 — FrodoKEM.** Ring / module / plain LWE spectrum, parameter table, keygen–encaps–decaps with the decryption-failure caveat.
- **8 — Other families.** Map of multivariate, code-based, hash-based, isogeny with status pills; the T∘F∘S trapdoor; McEliece/Niederreiter; Lamport signatures; SWIFFT; isogeny key exchange as a commutative square.

## Build

None. One self-contained HTML file: inline CSS, inline SVG, vanilla JS for the six playgrounds. The only external request is Google Fonts (IBM Plex Sans / Mono) with system fallbacks. Light and dark follow the OS setting.

## Notes on accuracy

The diagrams follow the course. Where the transcript's numbers did not reconcile, the page uses its own worked examples, all checked by computation: the lesson-4 LWE key, the NTRU polynomials (inverses verified mod 41 and mod 3), baby Kyber (decrypts to 1011 with margin), and the Lamport key sizes. Status pills on the family map and the note that SIKE was broken in 2022 are the notes' additions, not the course's.

Course content © Pearson and Dr. Chuck Easttom. These notes are a student's paraphrase and illustration, not a transcript.
