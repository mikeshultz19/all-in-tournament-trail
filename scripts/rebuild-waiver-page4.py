from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/forms/AITT-Participant-Liability-Waiver-Form.pdf"
PAGE = ROOT / "tmp/pdfs/waiver-page-4-text.pdf"
OUTPUT = ROOT / "tmp/pdfs/AITT-Participant-Liability-Waiver-Form-rebuilt.pdf"

PAGE.parent.mkdir(parents=True, exist_ok=True)
width, height = letter
left, right, top = 76, 76, 752
body_size, body_leading = 8.5, 10.3
heading_size, heading_leading = 11.5, 14
usable_width = width - left - right

paragraphs = [
    ("bullet", "Livestreams and event coverage"),
    ("bullet", "Promotional materials and advertising"),
    ("bullet", "Sponsor communications"),
    ("bullet", "Historical archives and future AITT marketing"),
    ("body", "No additional compensation is required unless AITT and the participant agree otherwise in writing. These rights are limited to uses reasonably related to AITT activities and remain subject to applicable law."),
    ("body", "If a minor participates, any media permission must be reviewed and accepted by a parent or legal guardian as required by law and these Official Tournament Rules."),
    ("heading", "16. Minors"),
    ("body", "Participants who are sixteen (16) years of age or older may compete as solo anglers, subject to all registration, waiver, safety, licensing, and eligibility requirements."),
    ("body", "A participant under eighteen (18) years of age must have a parent or legal guardian complete and sign all required registration acknowledgments, liability waivers, and participation approvals before the participant may compete."),
    ("body", "The parent or legal guardian does not need to be Angler 1 or Angler 2. A minor may fish with another adult, including an adult teammate, but that adult may not replace the parent or legal guardian's signature unless they are the minor's legal guardian. A minor may not compete unless the parent or legal guardian has provided that signed consent."),
    ("body", "A participant under sixteen (16) years of age may not compete as a solo angler and must compete with a parent, legal guardian, or another adult approved by the parent or legal guardian. The accompanying adult is responsible for the minor participant's supervision, safety, compliance with tournament rules, and lawful operation of the boat. Stricter requirements imposed by applicable law control."),
    ("heading", "17. Electronic Acknowledgment and Signature"),
    ("body", "By checking the acknowledgment during online registration or signing this paper form, each participant confirms access to and review of:"),
    ("bullet", "The Official Tournament Rules"),
    ("bullet", "This Participant Liability Waiver and Assumption of Risk"),
    ("bullet", "The AITT Privacy Policy"),
    ("body", "Online acknowledgment requires an affirmative, unchecked-by-default action before payment."),
    ("body", "Visiting a policy page, browsing the website, or beginning a form does not constitute agreement."),
    ("body", "The online acknowledgment and handwritten signature record agreement where permitted by law."),
    ("body", "Payment-card information is processed by Square, a third-party payment provider. AITT does not store credit-card numbers, CVV codes, or other payment-card credentials."),
    ("heading", "18. Governing Law"),
    ("body", "This waiver is intended to be governed by the laws of the State of Texas, subject to any law that must apply regardless of this provision."),
    ("heading", "19. Severability"),
    ("body", "If a court or other authority determines that a provision is invalid or unenforceable, the remaining provisions should remain in effect to the fullest extent permitted by law."),
    ("body", "Where legally permitted, an unenforceable provision may be limited or modified only to the minimum extent necessary to make it enforceable. Severability does not expand any provision beyond what applicable law allows."),
    ("heading", "20. Entire Agreement and No Oral Modification"),
    ("body", "This waiver, together with the Official Tournament Rules and applicable written registration terms, represents the participant's agreement concerning the subjects it covers."),
    ("body", "A tournament-day conversation, informal statement, or verbal comment does not silently replace this written waiver. Any official waiver modification must be made by AITT through an authorized written process."),
    ("body", "This section does not prevent Tournament Officials from issuing lawful emergency instructions, safety directions, schedule changes, or rules clarifications within their authority."),
    ("heading", "21. Participant Safety Acknowledgment"),
    ("body", "I understand that competitive fishing and boating involve risks that cannot be completely eliminated."),
    ("body", "I acknowledge that I am responsible for my own safety, the safe operation of my vessel, and the decisions I make while participating in an All-In Tournament Trail event."),
    ("body", "I understand that Tournament Officials cannot continuously supervise me or guarantee my safety while I am on the water."),
    ("body", "I voluntarily accept the risks associated with participation, including risks arising from accidents, weather, equipment failures, the actions of others, and my own decisions, errors, omissions, or negligence, to the fullest extent permitted by applicable law."),
    ("body", "I understand that I may withdraw from participation whenever I believe conditions are unsafe."),
]


def wrap(text: str, font: str, size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and stringWidth(candidate, font, size) > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


c = canvas.Canvas(str(PAGE), pagesize=letter)
c.setTitle("AITT Participant Liability Waiver Form")
c.setFont("Helvetica-Bold", 10)
c.drawString(left, top, "AITT PARTICIPANT LIABILITY WAIVER FORM")
y = top - 38
for kind, text in paragraphs:
    if kind == "heading":
        y -= 4
        c.setFont("Helvetica-Bold", heading_size)
        c.drawString(left, y, text)
        y -= heading_leading
        continue
    c.setFont("Helvetica", body_size)
    indent = 10 if kind == "bullet" else 0
    prefix = "• " if kind == "bullet" else ""
    for index, line in enumerate(wrap(text, "Helvetica", body_size, usable_width - indent)):
        c.drawString(left + indent, y, (prefix if index == 0 else "") + line)
        y -= body_leading
    y -= 2

c.setFont("Helvetica", 9)
c.drawRightString(width - right, 34, "Page 4")
c.save()

reader = PdfReader(str(SOURCE))
replacement = PdfReader(str(PAGE)).pages[0]
writer = PdfWriter()
for index, page in enumerate(reader.pages):
    writer.add_page(replacement if index == 3 else page)
with OUTPUT.open("wb") as stream:
    writer.write(stream)
SOURCE.write_bytes(OUTPUT.read_bytes())
