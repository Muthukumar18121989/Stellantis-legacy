import os, sys
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
T = [
 ("01-getting-started","Getting Started","Sign in, the top bar, the left menu and your Experiments page.",
  ["Signing in","The top bar: notifications, language and your user menu","The left menu","Opening the User Manual"]),
 ("02-experiments-projects","Experiments and Projects","Find, filter and open promotions in My Projects.",
  ["My Projects rail","Filtering the Promotion Optimization list","Reading the action status","Workflow history"]),
 ("03-create-promotion","Creating a Promotion","Create a new promotion and set its type and configuration.",
  ["Create New Promo","The six promotion types","Promotion configuration","Saving and moving to selection"]),
 ("04-article-selection","Article Selection and Analysis","Choose families, review exclusions, volume and price analysis.",
  ["Manage Families and uploads","Exclusions","Volume Analysis and monthly trend","Price Analysis and thresholds"]),
 ("05-simulation-results","Simulation and Results","Run a simulation and read the KPI summary and drilldown.",
  ["Running a simulation","KPI summary cards","Drilldown and Overall Margin","Comparing experiments"]),
 ("06-logistics-approval","Logistics and Approval","Split volumes, submit for approval and follow the workflow.",
  ["Logistics volume split","Submit Promotion for Approval","Workflow Tracker","Modify Promotion and Volume Split Needed"]),
 ("07-reports","Reports","Find and download reports from the Report Hub.",
  ["Report Hub tabs","Filters","Downloading a report"]),
 ("08-settings-delegation","User Settings and Delegation","Change your password and manage delegations.",
  ["Security and password","Outgoing delegations","Incoming delegation requests","Delegations granted to you"]),
 ("09-administration","Administration","DOA rules, user management and role management for admins.",
  ["DOA Rules","User Management and bulk upload","Role Management"]),
]
blue=HexColor("#007dc5"); dark=HexColor("#323436"); grey=HexColor("#727476"); line=HexColor("#bfe0f5")
W,H=A4
for slug,title,desc,secs in T:
    c=canvas.Canvas(os.path.join(out,slug+".pdf"),pagesize=A4)
    c.setTitle("Promotool User Manual - "+title); c.setAuthor("Promotool"); c.setSubject("Sample placeholder")
    def frame(page):
        c.setFillColor(blue); c.rect(0,H-14,W,14,fill=1,stroke=0)
        c.setFillColor(grey); c.setFont("Helvetica",9)
        c.drawString(56,40,"Promotool User Manual  |  "+title); c.drawRightString(W-56,40,"Page %d"%page)
        c.setFillColor(HexColor("#d40040")); c.setFont("Helvetica-Bold",9)
        c.drawCentredString(W/2,40,"SAMPLE PLACEHOLDER")
    frame(1)
    c.setFillColor(blue); c.setFont("Helvetica-Bold",12); c.drawString(56,H-110,"PROMOTOOL USER MANUAL")
    c.setFillColor(dark); c.setFont("Helvetica-Bold",30); c.drawString(56,H-150,title)
    c.setFont("Helvetica",13); c.setFillColor(grey); c.drawString(56,H-176,desc)
    c.setStrokeColor(line); c.setLineWidth(1); c.line(56,H-200,W-56,H-200)
    c.setFillColor(HexColor("#eff9ff")); c.roundRect(56,H-290,W-112,70,8,fill=1,stroke=0)
    c.setFillColor(HexColor("#0066a1")); c.setFont("Helvetica-Bold",11); c.drawString(72,H-245,"This is a sample placeholder document.")
    c.setFont("Helvetica",10); c.drawString(72,H-263,"It stands in for the real chapter and will be replaced when the final manual is written.")
    c.setFillColor(dark); c.setFont("Helvetica-Bold",14); c.drawString(56,H-330,"Contents")
    y=H-356
    for i,s in enumerate(secs,1):
        c.setFont("Helvetica",11); c.drawString(72,y,"%d.  %s"%(i,s)); c.setFillColor(grey); c.drawRightString(W-56,y,str(2)); c.setFillColor(dark); y-=22
    c.showPage(); frame(2); y=H-90
    for i,s in enumerate(secs,1):
        c.setFillColor(blue); c.rect(56,y-3,4,16,fill=1,stroke=0)
        c.setFillColor(dark); c.setFont("Helvetica-Bold",13); c.drawString(68,y,"%d. %s"%(i,s)); y-=22
        c.setFont("Helvetica",10.5); c.setFillColor(grey)
        for t in ["Placeholder text. This section will explain "+s.lower()+",","with step-by-step instructions and screenshots from the Promotool pages."]:
            c.drawString(68,y,t); y-=16
        y-=18
    c.showPage(); c.save()
print(len(T))
