# quantum-crypto-illustrated

Illustrated study notes for Easttom's Quantum Cryptography course — RSA, DH, lattices, LWE, NTRU, Kyber and FrodoKEM worked with real numbers, one self-contained page with two live playgrounds.

**Live page:** <https://systemslibrarian.github.io/quantum-crypto-illustrated/>

## What's on the page

- **1 — The threat & the math RSA runs on.** Trapdoor arrows (easy forward, Shor backward), which families break, mod arithmetic on a clock and number line, φ(15) on a strip, the RSA pipeline with p = 17, q = 11 and a live playground, Diffie-Hellman as an exchange diagram.
- **2 — Math for quantum cryptography.** Venn quartet, injective/surjective/bijective maps, vectors and independence, group ⊂ ring ⊂ field, the truncated polynomial ring.
- **3 — Standards.** NIST map (ML-KEM, ML-DSA, SLH-DSA, FN-DSA, FIPS numbers, old names), CNSA 2.0 table.
- **4 — Lattices.** Good vs bad basis of one lattice with SVP/CVP marked, the problems table, LWE built in three stages from a self-consistent toy key with an encrypt-a-bit playground, the decoder dial, IND-CPA ⊂ CCA ⊂ CCA2, the CCA1/CCA2 timeline, why FO earns CCA2.
- **5 — NTRU.** Parameter cards, a fully worked keygen/encrypt/decrypt with N = 7, q = 41, p = 3 (every polynomial shown), and the algebra of why the p·r·g term vanishes.
- **6 — CRYSTALS.** Parameter-set table with real byte sizes, the "one ring, three k" module diagram, baby Kyber fully worked in ℤ₁₇[x]/(x⁴+1) encrypting 11 → 1011, the Fujisaki–Okamoto transform drawn, the NIST-round change timeline, side-channel vs algorithm.
- **7 — FrodoKEM.** Ring / module / plain LWE spectrum, parameter table, keygen–encaps–decaps with the decryption-failure caveat.
- **8 — Other families.** Map of multivariate, code-based, hash-based, isogeny with status pills; the T∘F∘S trapdoor; McEliece/Niederreiter; Lamport signatures; SWIFFT; isogeny key exchange as a commutative square.

## Build

None. One self-contained HTML file: inline CSS, inline SVG, vanilla JS for the two playgrounds. The only external request is Google Fonts (IBM Plex Sans / Mono) with system fallbacks. Light and dark follow the OS setting.

## Notes on accuracy

The diagrams follow the course. Where the transcript's numbers did not reconcile, the page uses its own worked examples, all checked by computation: the lesson-4 LWE key, the NTRU polynomials (inverses verified mod 41 and mod 3), baby Kyber (decrypts to 1011 with margin), and the Lamport key sizes. Status pills on the family map and the note that SIKE was broken in 2022 are the notes' additions, not the course's.

Course content © Pearson and Dr. Chuck Easttom. These notes are a student's paraphrase and illustration, not a transcript.
