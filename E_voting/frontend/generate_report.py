
# ---------------------------------------------------------------------------
# DIAGRAM GENERATION
# ---------------------------------------------------------------------------

def create_arch_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(10, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    layers = [
        (0.5, 7.5, 9, 1.8, '#2196F3', 'FRONTEND LAYER', 'React 19 + Vite  |  React Router DOM  |  Axios  |  Recharts'),
        (0.5, 5.3, 9, 1.8, '#4CAF50', 'BACKEND LAYER', 'Django 5.2 + DRF  |  JWT Auth  |  SMTP Email  |  REST APIs'),
        (0.5, 3.1, 9, 1.8, '#FF9800', 'AI / FACE AUTH MODULE', 'OpenCV LBPH  |  Haar Cascade  |  Duplicate Detection  |  Fraud Detection'),
        (0.5, 0.9, 9, 1.8, '#9C27B0', 'BLOCKCHAIN + DATABASE', 'SHA-256 Custom Chain  |  MySQL 8.0  |  Block Model  |  Chain Validation'),
    ]
    for (x, y, w, h, color, title, subtitle) in layers:
        rect = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.1',
                              facecolor=color, edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h*0.65, title, ha='center', va='center',
                fontsize=13, fontweight='bold', color='white')
        ax.text(x + w/2, y + h*0.3, subtitle, ha='center', va='center',
                fontsize=9, color='white', alpha=0.95)
    for y_start in [7.5, 5.3, 3.1]:
        ax.annotate('', xy=(5, y_start), xytext=(5, y_start + 1.8),
                    arrowprops=dict(arrowstyle='->', color='#333333', lw=2))
    ax.set_title('TrueVote System Architecture', fontsize=16, fontweight='bold',
                 color='#003366', pad=15)
    plt.tight_layout()
    plt.savefig('arch_diagram.png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print('Created arch_diagram.png')

def create_reg_flow():
    fig, ax = plt.subplots(figsize=(10, 14))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 16)
    ax.axis('off')
    def box(x, y, w, h, text, color='#2196F3', tcolor='white', shape='rect'):
        if shape == 'diamond':
            diamond = plt.Polygon([[x+w/2,y+h],[x+w,y+h/2],[x+w/2,y],[x,y+h/2]],
                                  facecolor=color, edgecolor='white', linewidth=1.5)
            ax.add_patch(diamond)
            ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=8, color=tcolor, fontweight='bold')
        else:
            rect = FancyBboxPatch((x,y), w, h, boxstyle='round,pad=0.05',
                                  facecolor=color, edgecolor='white', linewidth=1.5)
            ax.add_patch(rect)
            ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=8.5, color=tcolor, fontweight='bold')
    def arrow(x1,y1,x2,y2):
        ax.annotate('', xy=(x2,y2), xytext=(x1,y1),
                    arrowprops=dict(arrowstyle='->', color='#555', lw=1.5))
    steps = [
        (3.5, 14.5, 3, 0.8, 'START', '#1B5E20'),
        (3.5, 13.2, 3, 0.8, 'Fill Registration Form', '#1565C0'),
        (3.5, 11.9, 3, 0.8, 'Submit to Backend', '#1565C0'),
        (3.5, 10.6, 3, 0.8, 'Generate OTP & Send Email', '#1565C0'),
        (3.5, 9.3, 3, 0.8, 'Enter OTP', '#1565C0'),
    ]
    for (x,y,w,h,t,c) in steps:
        box(x,y,w,h,t,c)
    box(3.0, 7.8, 4, 1.0, 'OTP Valid?', '#E65100', shape='diamond')
    box(3.5, 6.5, 3, 0.8, 'Capture Face Frames (15-20)', '#1565C0')
    box(3.5, 5.2, 3, 0.8, 'Check Duplicate Face', '#1565C0')
    box(3.0, 3.7, 4, 1.0, 'Duplicate?', '#E65100', shape='diamond')
    box(7.0, 3.7, 2.5, 1.0, 'Deny Registration', '#B71C1C')
    box(3.5, 2.4, 3, 0.8, 'Save Frames & Train LBPH', '#1565C0')
    box(3.5, 1.1, 3, 0.8, 'Create Voter Record in DB', '#1565C0')
    box(3.5, 0.0, 3, 0.8, 'Registration Complete', '#1B5E20')
    box(0.5, 7.8, 2.0, 1.0, 'Resend OTP', '#FF6F00')
    for (y1,y2) in [(15.3,14.5),(14.0,13.2),(13.0,11.9),(12.7,10.6),(11.4,9.3),(10.1,8.8)]:
        arrow(5, y1, 5, y2)
    arrow(5, 8.8, 5, 7.3)
    arrow(5, 7.3, 5, 6.5)
    arrow(5, 7.3, 1.5, 7.3)
    ax.annotate('No', xy=(1.5, 8.3), xytext=(3.0, 8.3), fontsize=8, color='red')
    arrow(5, 7.3, 5, 6.5)
    arrow(5, 6.5, 5, 5.2)
    arrow(5, 5.2, 5, 4.7)
    arrow(5, 4.7, 5, 4.2)
    arrow(7.0, 4.2, 7.0, 3.7)
    ax.text(6.0, 4.5, 'Yes', fontsize=8, color='red')
    arrow(5, 3.7, 5, 2.4)
    ax.text(5.1, 3.5, 'No', fontsize=8, color='green')
    arrow(5, 2.4, 5, 1.1)
    arrow(5, 1.1, 5, 0.0)
    ax.set_title('Voter Registration Flow', fontsize=14, fontweight='bold', color='#003366')
    plt.tight_layout()
    plt.savefig('reg_flow.png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print('Created reg_flow.png')

# ---------------------------------------------------------------------------
# DOCUMENT SECTIONS
# ---------------------------------------------------------------------------

def add_title_page(doc):
    section = doc.sections[0]
    set_doc_margins(section)
    header = section.header
    header.is_linked_to_previous = False
    for p in header.paragraphs:
        p.clear()
    footer = section.footer
    footer.is_linked_to_previous = False
    for p in footer.paragraphs:
        p.clear()
    def cp(text, size=12, bold=False, space_before=0, space_after=6, italic=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.italic = italic
        return p
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20)
    p.paragraph_format.space_after = Pt(10)
    run = p.add_run()
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    drawing = OxmlElement('w:r')
    try:
        import io
        import matplotlib.pyplot as plt2
        import matplotlib
        matplotlib.use('Agg')
        fig2, ax2 = plt2.subplots(figsize=(2, 2))
        ax2.set_facecolor('#003366')
        ax2.text(0.5, 0.5, 'SANSKRITI' + chr(10) + 'UNIVERSITY',
                 ha='center', va='center', fontsize=11, fontweight='bold',
                 color='white', transform=ax2.transAxes)
        ax2.axis('off')
        plt2.tight_layout(pad=0)
        plt2.savefig('logo_placeholder.png', dpi=100, bbox_inches='tight', facecolor='#003366')
        plt2.close()
        run.add_picture('logo_placeholder.png', width=Inches(2), height=Inches(2))
    except Exception as e:
        print(f'Logo placeholder error: {e}')
    cp('', space_before=10, space_after=4)
    cp('TrueVote: AI Powered Blockchain Based E-Voting System', size=16, bold=True, space_before=10, space_after=10)
    cp('A PROJECT REPORT', size=13, bold=True, space_before=8, space_after=6)
    cp('Submitted in partial fulfillment of the award of Degree of', size=12, space_before=6, space_after=2)
    cp('Bachelor of Technology in Computer Science and Engineering', size=12, space_before=0, space_after=12)
    cp('Submitted by:', size=12, bold=True, space_before=10, space_after=2)
    cp('Jitendra Singh', size=12, space_before=0, space_after=2)
    cp('Enrollment No: 2302305081', size=12, space_before=0, space_after=10)
    cp('Under the Supervision of', size=12, space_before=6, space_after=2)
    cp('Ms. Geetika', size=12, bold=True, space_before=0, space_after=2)
    cp('Assistant Professor', size=12, space_before=0, space_after=10)
    cp('Department of Computer Science and Engineering', size=12, bold=True, space_before=8, space_after=4)
    cp('SANSKRITI UNIVERSITY, MATHURA, U.P.', size=13, bold=True, space_before=4, space_after=4)
    cp('May, 2026', size=12, space_before=4, space_after=0)
    doc.add_page_break()

def add_certificate_page(doc):
    add_heading(doc, 'CERTIFICATE', level=1)
    cert_text = ('This is to certify that the work embodied in this project report entitled '
                 + chr(39) + 'TrueVote: AI Powered Blockchain Based E-Voting System' + chr(39)
                 + ' being submitted by Jitendra Singh, Enrollment No: 2302305081 for partial '
                 + 'fulfillment of the requirement for the award of Bachelor of Technology in '
                 + 'Computer Science and Engineering to Sanskriti University, Mathura during the '
                 + 'academic year 2025-26 is a record of bonafide piece of work, undertaken under '
                 + 'the supervision of the undersigned.')
    add_body_para(doc, cert_text)
    add_body_para(doc, '')
    add_body_para(doc, '')
    p1 = doc.add_paragraph()
    p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r1 = p1.add_run('Approved and Supervised by:')
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(12)
    r1.font.bold = True
    add_body_para(doc, 'Ms. Geetika')
    add_body_para(doc, 'Assistant Professor, SOEIT')
    add_body_para(doc, '')
    add_body_para(doc, '')
    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r2 = p2.add_run('Forwarded by:')
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(12)
    r2.font.bold = True
    add_body_para(doc, 'Dean, SOEIT')
    doc.add_page_break()

def add_declaration_page(doc):
    add_heading(doc, 'DECLARATION', level=1)
    decl_text = ('I, Jitendra Singh, a student of Bachelor of Technology in Computer Science and '
                  + 'Engineering, Session: 2025-26, Sanskriti University, Mathura hereby declare '
                  + 'that the work presented in this project report entitled '
                  + chr(39) + 'TrueVote: AI Powered Blockchain Based E-Voting System' + chr(39)
                  + ' is the outcome of my own bonafide work and is correct to the best of my '
                  + 'knowledge and this work has been undertaken taking care of Engineering Ethics. '
                  + 'It contains no material previously published or written by another person nor '
                  + 'material which has been accepted for the award of any other degree or diploma '
                  + 'of the university or other institute of higher learning, except where due '
                  + 'acknowledgment has been made in the text.')
    add_body_para(doc, decl_text)
    add_body_para(doc, '')
    add_body_para(doc, '')
    add_body_para(doc, 'Jitendra Singh')
    add_body_para(doc, 'Enrollment No: 2302305081')
    add_body_para(doc, 'Date: May 2026')
    doc.add_page_break()

def add_acknowledgement_page(doc):
    add_heading(doc, 'ACKNOWLEDGEMENT', level=1)
    ack_text = ('I would like to express my sincere gratitude to my Project Supervisor Ms. Geetika, '
                 + 'Assistant Professor, Department of Computer Science and Engineering, Sanskriti '
                 + 'University, for her invaluable guidance, constant encouragement, and constructive '
                 + 'feedback throughout the development of this project. Her expertise and dedication '
                 + 'have been instrumental in shaping this work. I am also grateful to the '
                 + 'Hon' + chr(39) + 'ble Chancellor, Hon' + chr(39) + 'ble Vice Chancellor, and the Respected Dean SOEIT '
                 + 'for providing the necessary infrastructure and academic environment. I acknowledge '
                 + 'my parents and friends for their moral support and encouragement. I also declare '
                 + 'to the best of my knowledge and belief that this work has not been submitted '
                 + 'anywhere else.')
    add_body_para(doc, ack_text)
    add_body_para(doc, '')
    add_body_para(doc, '')
    add_body_para(doc, 'Jitendra Singh')
    add_body_para(doc, 'Enrollment No: 2302305081')
    doc.add_page_break()

def add_toc_page(doc):
    add_heading(doc, 'TABLE OF CONTENTS', level=1)
    toc_data = [
        ('Certificate', 'ii'),
        ('Declaration', 'iii'),
        ('Acknowledgement', 'iv'),
        ('Table of Contents', 'v'),
        ('List of Figures', 'vi'),
        ('Abbreviations', 'vii'),
        ('List of Standards', 'viii'),
        ('Abstract', 'ix'),
        ('Chapter 1: Introduction', '1'),
        ('    1.1 Identification of Client / Need / Relevant Contemporary Issue', '1'),
        ('    1.2 Justification of the Issue through Statistics and Documentation', '3'),
        ('    1.3 The Problem Requires Resolution', '4'),
        ('    1.4 Justification of the Need through a Survey', '5'),
        ('    1.5 Relevant Contemporary Issue Documented in Reports by Agencies', '6'),
        ('Chapter 2: Literature Review', '9'),
        ('    2.1 Introduction to the Literature Review', '9'),
        ('    2.2 Blockchain Technology in E-Voting', '11'),
        ('    2.3 Artificial Intelligence in Voter Authentication', '14'),
        ('    2.4 Research Gaps', '18'),
        ('Chapter 3: Methodology', '25'),
        ('    3.1 Development Approach', '25'),
        ('    3.2 System Architecture', '26'),
        ('    3.3 Technology Stack', '27'),
        ('    3.4 Problem Definition', '28'),
        ('    3.5 Goals and Objectives', '29'),
        ('    3.6 Scope of the System', '30'),
        ('    3.7 System Requirements', '31'),
        ('Chapter 4: Design Flow / Process', '47'),
        ('    4.1 System Architecture Diagram', '47'),
        ('    4.2 Design Flow', '48'),
        ('    4.3 Database Design', '50'),
        ('    4.4 API Endpoints', '52'),
        ('    4.5 Use Case Diagram', '54'),
        ('    4.6 Sequence Diagram', '56'),
        ('    4.7 Class Diagram', '58'),
        ('Chapter 5: Results Analysis and Validation', '66'),
        ('    5.1 Implementation of Solution', '66'),
        ('    5.2 System Screenshots Description', '68'),
        ('    5.3 Performance Evaluation Table', '70'),
        ('    5.4 Validation Test Cases', '72'),
        ('    5.5 Challenges and Solutions', '74'),
        ('Chapter 6: Conclusion and Future Work', '77'),
        ('References', '80'),
    ]
    make_table(doc, ['Topic', 'Page No.'], toc_data, col_widths=[Inches(5.5), Inches(1.0)])
    doc.add_page_break()

def add_list_of_figures(doc):
    add_heading(doc, 'LIST OF FIGURES', level=1)
    figs = [
        ('Figure 4.1', 'TrueVote System Architecture Diagram', '47'),
        ('Figure 4.2', 'Voter Registration Flow Diagram', '48'),
        ('Figure 4.3', 'Vote Casting Flow Diagram', '49'),
        ('Figure 4.4', 'TrueVote Blockchain Structure', '51'),
        ('Figure 4.5', 'Use Case Diagram', '54'),
        ('Figure 4.6', 'Entity-Relationship Diagram', '58'),
        ('Figure 5.1', 'System Performance Metrics Bar Chart', '70'),
        ('Figure 5.2', 'Validation Test Results Pie Chart', '73'),
    ]
    make_table(doc, ['Figure No.', 'Figure Title', 'Page No.'], figs,
               col_widths=[Inches(1.2), Inches(4.5), Inches(0.8)])
    doc.add_page_break()

def add_abbreviations_page(doc):
    add_heading(doc, 'ABBREVIATIONS', level=1)
    abbrevs = [
        ('AI', 'Artificial Intelligence'),
        ('API', 'Application Programming Interface'),
        ('CORS', 'Cross-Origin Resource Sharing'),
        ('CSS', 'Cascading Style Sheets'),
        ('CRUD', 'Create Read Update Delete'),
        ('DB', 'Database'),
        ('DRF', 'Django REST Framework'),
        ('HTML', 'Hyper-Text Markup Language'),
        ('HTTP', 'Hypertext Transfer Protocol'),
        ('JS', 'JavaScript'),
        ('JSON', 'JavaScript Object Notation'),
        ('JWT', 'JSON Web Token'),
        ('LBPH', 'Local Binary Pattern Histogram'),
        ('ML', 'Machine Learning'),
        ('MVC', 'Model View Controller'),
        ('OTP', 'One Time Password'),
        ('REST', 'Representational State Transfer'),
        ('SHA', 'Secure Hash Algorithm'),
        ('SPA', 'Single Page Application'),
        ('SQL', 'Structured Query Language'),
        ('UI', 'User Interface'),
        ('UX', 'User Experience'),
        ('WCAG', 'Web Content Accessibility Guidelines'),
    ]
    make_table(doc, ['Abbreviation', 'Full Form'], abbrevs,
               col_widths=[Inches(1.5), Inches(5.0)])
    doc.add_page_break()

def add_standards_page(doc):
    add_heading(doc, 'LIST OF STANDARDS', level=1)
    standards = [
        ('ISO/IEC 25010', 'ISO/IEC', 'Defines software product quality models including usability, reliability, and performance efficiency'),
        ('ISO/IEC 29119', 'ISO/IEC', 'Establishes processes for software testing to ensure functionality and reliability'),
        ('WCAG 2.1', 'W3C', 'Web Content Accessibility Guidelines to make web interfaces accessible to users with disabilities'),
        ('IEEE 830', 'IEEE', 'Guides the creation of clear and precise Software Requirements Specifications (SRS)'),
        ('ISO/IEC 27001', 'ISO/IEC', 'Specifies requirements for an information security management system (ISMS)'),
        ('ISO/IEC 12207', 'ISO/IEC', 'Details lifecycle processes for software development including planning, design, and maintenance'),
    ]
    make_table(doc, ['Standard', 'Publishing Agency', 'About the Standard'], standards,
               col_widths=[Inches(1.3), Inches(1.5), Inches(3.7)])
    doc.add_page_break()

def add_abstract_page(doc):
    add_heading(doc, 'ABSTRACT', level=1)
    abstract = ('The TrueVote system is an AI-powered blockchain-based e-voting platform designed to '
                 + 'create a secure, transparent, and tamper-proof digital voting environment. Traditional '
                 + 'voting systems often rely on manual processes or centralized electronic machines, which '
                 + 'face issues such as security vulnerabilities, lack of transparency, and slow result '
                 + 'generation. This project proposes a decentralized voting system using a custom blockchain '
                 + 'implementation where each vote is stored as an immutable, cryptographically linked '
                 + 'transaction. The backend is developed using Python and Django REST Framework, while a '
                 + 'custom SHA-256 blockchain ensures data integrity and transparency. Artificial Intelligence '
                 + 'techniques are employed for voter identity verification through OpenCV' + chr(39) + 's LBPH face '
                 + 'recognition algorithm, duplicate face detection during registration, and real-time fraud '
                 + 'detection using time-window anomaly analysis. The system allows voters to authenticate '
                 + 'securely via face recognition, cast votes through a React.js web interface, and receive '
                 + 'a cryptographic receipt with their blockchain hash as proof of vote. Once stored, votes '
                 + 'cannot be altered or deleted, ensuring trust in the electoral process. The frontend is '
                 + 'built using React 19 with Vite, Recharts for data visualization, and React Router for '
                 + 'navigation. The system uses MySQL as the relational database, JWT for authentication, '
                 + 'and SMTP email for OTP verification. This solution improves election transparency, '
                 + 'enhances voter trust, reduces operational costs, and enables secure remote voting.')
    add_body_para(doc, abstract)
    doc.add_page_break()

def add_chapter1(doc):
    add_heading(doc, 'CHAPTER 1: INTRODUCTION', level=1)
    add_heading(doc, '1.1 Identification of Client / Need / Relevant Contemporary Issue', level=2)
    add_body_para(doc, ('In the modern digital era, the need for secure, transparent, and efficient voting systems '
                         + 'has become increasingly significant. Traditional voting methods, including paper-based '
                         + 'ballots and conventional electronic voting machines, face several challenges such as voter '
                         + 'fraud, lack of transparency, tampering risks, delayed result processing, and limited '
                         + 'accessibility for remote voters. These issues raise concerns among governments, election '
                         + 'authorities, and citizens regarding the reliability and integrity of electoral processes.'))
    add_body_para(doc, ('The primary clients for an AI-powered blockchain-based e-voting system are government bodies, '
                         + 'election commissions, and public institutions responsible for conducting elections. '
                         + 'Additionally, organizations such as universities, corporate entities, and international '
                         + 'institutions that require secure voting mechanisms can also benefit from such a system. '
                         + 'These stakeholders demand a solution that ensures accuracy, security, transparency, and '
                         + 'voter privacy while being scalable and user-friendly.'))
    add_body_para(doc, ('A key contemporary issue is the growing demand for digital transformation in governance, '
                         + 'especially in the context of increasing internet penetration and mobile usage. Events such '
                         + 'as global pandemics have further highlighted the necessity for remote and contactless voting '
                         + 'solutions. However, existing online voting systems often suffer from cybersecurity threats, '
                         + 'identity theft, and lack of trust among users.'))
    add_body_para(doc, ('To address these challenges, the integration of blockchain technology and artificial '
                         + 'intelligence offers a promising solution. Blockchain provides a decentralized and immutable '
                         + 'ledger that prevents unauthorized modification of votes, while AI enhances the system '
                         + 'through intelligent voter authentication, fraud detection, and anomaly analysis. This '
                         + 'combination ensures a highly secure, transparent, and efficient voting system capable of '
                         + 'meeting the demands of modern democratic processes.'))
    add_heading(doc, '1.2 Justification of the Issue through Statistics and Documentation', level=2)
    add_body_para(doc, ('The need for a secure and reliable voting system is strongly supported by global statistics '
                         + 'and documented challenges. Electoral fraud, low voter turnout, cybersecurity threats, and '
                         + 'lack of transparency continue to undermine public trust in democratic processes worldwide. '
                         + 'According to reports by the International Institute for Democracy and Electoral Assistance, '
                         + 'voter turnout has shown inconsistent trends across many democracies. The Election Commission '
                         + 'of India has highlighted logistical challenges in managing large-scale elections with over '
                         + '900 million eligible voters. Studies from NIST indicate that centralized digital voting '
                         + 'systems are vulnerable to hacking, data breaches, and manipulation. The 2016 United States '
                         + 'election interference demonstrated how digital infrastructure in elections can be targeted. '
                         + 'A Pew Research Center survey found that a significant percentage of voters are concerned '
                         + 'about whether their votes are accurately counted and securely stored.'))
    add_heading(doc, '1.3 The Problem Requires Resolution', level=2)
    add_body_para(doc, ('Most existing e-voting systems are built on centralized architectures, making them '
                         + 'susceptible to cyberattacks, data breaches, and manipulation of voting records. Voters are '
                         + 'often unable to independently verify whether their votes have been accurately recorded and '
                         + 'counted. Risks such as duplicate voting, unauthorized access, and system tampering remain '
                         + 'significant concerns. A blockchain-based e-voting system addresses these challenges by '
                         + 'providing a decentralized and tamper-resistant platform where all votes are securely '
                         + 'recorded and cannot be altered once confirmed.'))
    add_heading(doc, '1.4 Justification of the Need through a Survey', level=2)
    add_body_para(doc, ('A survey conducted among students, working professionals, and general voters revealed that '
                         + 'a large number of respondents have concerns about the security and reliability of current '
                         + 'voting methods. Many participants expressed a lack of trust in electronic voting systems '
                         + 'due to risks of hacking, data manipulation, and unauthorized access. Respondents highlighted '
                         + 'the absence of transparency and concerns related to voter privacy. The survey revealed that '
                         + 'most respondents are willing to adopt a modern, technology-driven voting system that ensures '
                         + 'security, transparency, and ease of use.'))
    add_heading(doc, '1.5 Relevant Contemporary Issue Documented in Reports by Agencies', level=2)
    add_body_para(doc, ('Reports from the Election Commission of India, NIST, and the European Union Agency for '
                         + 'Cybersecurity emphasize the risks associated with centralized voting infrastructures. These '
                         + 'reports indicate that traditional and electronic voting systems may lack sufficient '
                         + 'transparency and auditability. Blockchain technology has been recognized in various research '
                         + 'and policy discussions as a promising approach due to its decentralized nature, cryptographic '
                         + 'security, and ability to provide immutable and verifiable records.'))
    doc.add_page_break()

def add_chapter2(doc):
    add_heading(doc, 'CHAPTER 2: LITERATURE REVIEW', level=1)
    add_heading(doc, '2.1 Introduction to the Literature Review', level=2)
    add_body_para(doc, ('The literature review provides a comprehensive overview of existing research and developments '
                         + 'in the field of blockchain-based electronic voting systems integrated with artificial '
                         + 'intelligence. Researchers have explored the use of blockchain technology to address the '
                         + 'limitations of traditional and electronic voting systems. Blockchain offers features such '
                         + 'as decentralization, immutability, and cryptographic security, which enhance the integrity '
                         + 'and transparency of the voting process. AI techniques such as machine learning and pattern '
                         + 'recognition can help identify suspicious activities, prevent unauthorized access, and ensure '
                         + 'fair election processes.'))
    add_heading(doc, '2.2 Blockchain Technology in E-Voting', level=2)
    add_body_para(doc, ('Blockchain technology has been widely proposed as a solution to the security and transparency '
                         + 'challenges of electronic voting. Studies show that blockchain ensures that once a vote is '
                         + 'recorded, it cannot be altered or deleted, thereby improving trust and integrity in the '
                         + 'electoral process. Smart contracts further enhance automation by enabling secure vote '
                         + 'validation and result computation without human intervention. Hjálmarsson et al. (2018) '
                         + 'demonstrated a blockchain-based e-voting system that significantly reduced the risk of vote '
                         + 'manipulation compared to traditional centralized systems.'))
    add_body_para(doc, ('Ayed (2017) proposed a conceptual secure blockchain-based electronic voting system that '
                         + 'leverages the immutability and transparency of blockchain to ensure election integrity. '
                         + 'McCorry et al. (2017) presented a decentralized voting protocol using Ethereum smart '
                         + 'contracts, demonstrating the feasibility of conducting elections on a public blockchain. '
                         + 'Zhao and Chan (2015) explored the use of Bitcoin-based protocols for secure e-voting, '
                         + 'highlighting the potential of cryptocurrency infrastructure for electoral applications. '
                         + 'These studies collectively demonstrate that blockchain provides a robust foundation for '
                         + 'building trustworthy and transparent voting systems.'))
    add_heading(doc, '2.3 Artificial Intelligence in Voter Authentication', level=2)
    add_body_para(doc, ('Artificial intelligence has been increasingly integrated into e-voting systems to enhance '
                         + 'security and functionality. AI techniques such as machine learning and deep learning are '
                         + 'used for voter authentication, anomaly detection, and fraud prevention. AI-based biometric '
                         + 'verification systems, including facial recognition and fingerprint analysis, have been '
                         + 'proposed to enhance identity validation and prevent impersonation. The LBPH (Local Binary '
                         + 'Pattern Histogram) algorithm, introduced by Ahonen et al. (2006), provides an efficient '
                         + 'and effective approach to face recognition suitable for real-time applications.'))
    add_body_para(doc, ('Viola and Jones (2001) introduced the Haar Cascade classifier, which remains widely used '
                         + 'for real-time face detection due to its computational efficiency. Turk and Pentland (1991) '
                         + 'pioneered the Eigenfaces approach for face recognition, laying the groundwork for modern '
                         + 'biometric authentication systems. More recent work by Taigman et al. (2014) with DeepFace '
                         + 'demonstrated near-human accuracy in face verification using deep neural networks. These '
                         + 'advancements in AI-based authentication provide a strong basis for implementing secure '
                         + 'voter identity verification in e-voting systems.'))
    add_heading(doc, '2.4 Research Gaps', level=2)
    add_body_para(doc, ('Despite these promising developments, the literature reveals that most existing research '
                         + 'focuses on either blockchain or AI independently, rather than integrating both technologies '
                         + 'into a unified system. Many blockchain-based voting systems proposed in research studies '
                         + 'are limited to small-scale environments or simulations. Privacy preservation remains a '
                         + 'critical concern - while blockchain ensures transparency, it also introduces challenges '
                         + 'related to voter anonymity. Usability is another major limitation - many proposed systems '
                         + 'are highly technical and not user-friendly. The primary research gap lies in the absence '
                         + 'of a fully integrated AI-powered blockchain-based e-voting framework that is scalable, '
                         + 'secure, privacy-preserving, user-friendly, and compliant with legal standards.'))
    doc.add_page_break()

def add_chapter3(doc):
    add_heading(doc, 'CHAPTER 3: METHODOLOGY', level=1)
    add_heading(doc, '3.1 Development Approach', level=2)
    add_body_para(doc, ('The development of the TrueVote system follows the Incremental and Agile model, which '
                         + 'allows continuous improvement through iterative development cycles. This approach is '
                         + 'suitable because the system combines multiple complex technologies such as blockchain, '
                         + 'artificial intelligence, and web development frameworks. Each module of the system is '
                         + 'developed, tested, and integrated step-by-step to ensure reliability and performance.'))
    add_heading(doc, '3.2 System Architecture', level=2)
    add_body_para(doc, ('The system is designed using a layered architecture consisting of four main layers: the '
                         + 'Frontend Layer (React.js SPA), the Backend Layer (Django REST Framework), the Blockchain '
                         + 'Layer (custom SHA-256 chain stored in MySQL), and the AI Module (OpenCV LBPH face '
                         + 'recognition). The frontend communicates with the backend exclusively through RESTful API '
                         + 'endpoints. JWT tokens are used for authentication on all protected routes.'))
    add_heading(doc, '3.3 Technology Stack', level=2)
    tech_data = [
        ('Backend', 'Python 3.11, Django 5.2, Django REST Framework, djangorestframework-simplejwt, django-cors-headers'),
        ('Frontend', 'React 19, Vite 8, React Router DOM 7, Axios, Recharts'),
        ('Database', 'MySQL 8.0'),
        ('AI/ML', 'OpenCV 4.x (LBPH Face Recognizer, Haar Cascade Detector)'),
        ('Authentication', 'JWT (JSON Web Token), OTP via Gmail SMTP'),
        ('Blockchain', 'Custom SHA-256 implementation using Python hashlib'),
    ]
    make_table(doc, ['Component', 'Technology'], tech_data,
               col_widths=[Inches(1.5), Inches(5.0)])
    add_heading(doc, '3.4 Problem Definition', level=2)
    add_body_para(doc, ('The problem addressed in this study is the lack of a secure, transparent, and trustworthy '
                         + 'electronic voting system that can ensure the integrity of electoral processes in the digital '
                         + 'era. Traditional voting systems are often centralized and vulnerable to data manipulation, '
                         + 'vote tampering, unauthorized access, and system failures. Existing electronic voting systems '
                         + 'also lack full end-to-end verifiability. The proposed AI-powered blockchain-based e-voting '
                         + 'system aims to solve these challenges by combining the decentralized and immutable nature '
                         + 'of blockchain with the intelligent capabilities of artificial intelligence.'))
    add_heading(doc, '3.5 Goals and Objectives', level=2)
    objectives = [
        ('1', 'Implement a blockchain-based vote storage system with SHA-256 cryptographic hashing.'),
        ('2', 'Develop an AI-powered face recognition system for voter authentication using OpenCV LBPH.'),
        ('3', 'Implement duplicate face detection to prevent multiple registrations by the same person.'),
        ('4', 'Implement real-time fraud detection using time-window anomaly analysis.'),
        ('5', 'Provide end-to-end vote verifiability through cryptographic receipts.'),
        ('6', 'Build a user-friendly React.js frontend with live results visualization.'),
    ]
    make_table(doc, ['No.', 'Objective'], objectives,
               col_widths=[Inches(0.5), Inches(6.0)])
    add_heading(doc, '3.6 Scope of the System', level=2)
    add_body_para(doc, ('The system is applicable to national elections, organizational elections, institutional '
                         + 'decision-making, student elections, and corporate governance voting processes. The system '
                         + 'primarily focuses on secure voter registration, authentication, vote casting, vote storage, '
                         + 'and result declaration. The system is limited to digital environments and requires internet '
                         + 'connectivity. Physical voting mechanisms and offline voting scenarios are outside the scope.'))
    add_heading(doc, '3.7 System Requirements', level=2)
    add_heading(doc, '3.7.1 Hardware Requirements', level=3)
    hw_data = [
        ('Processor', 'Intel Core i5 or higher'),
        ('RAM', '8GB minimum (16GB preferred)'),
        ('Storage', '256GB SSD'),
        ('Network', 'Stable internet connection'),
        ('Camera', 'Webcam for face capture (720p or higher)'),
    ]
    make_table(doc, ['Component', 'Specification'], hw_data,
               col_widths=[Inches(2.0), Inches(4.5)])
    add_heading(doc, '3.7.2 Software Requirements', level=3)
    sw_data = [
        ('Python', '3.11'),
        ('Django', '5.2'),
        ('MySQL', '8.0'),
        ('Node.js', '20.x'),
        ('OpenCV', '4.x'),
        ('Browser', 'Modern web browser (Chrome, Firefox, Edge)'),
    ]
    make_table(doc, ['Software', 'Version'], sw_data,
               col_widths=[Inches(2.0), Inches(4.5)])
    doc.add_page_break()

def add_chapter4(doc):
    add_heading(doc, 'CHAPTER 4: DESIGN FLOW / PROCESS', level=1)
    add_heading(doc, '4.1 System Architecture Diagram', level=2)
    add_body_para(doc, ('The TrueVote system follows a four-layer architecture that separates concerns between the '
                         + 'user interface, business logic, AI processing, and data storage. This layered design '
                         + 'ensures modularity, maintainability, and scalability of the system.'))
    add_figure(doc, 'arch_diagram.png', 'Figure 4.1: TrueVote System Architecture Diagram')
    add_heading(doc, '4.2 Design Flow', level=2)
    add_body_para(doc, ('The design flow of the TrueVote system follows a structured sequence of operations from '
                         + 'user registration to vote casting and result declaration. The complete flow is: User '
                         + 'Registration -> OTP Verification -> Face Capture -> Model Training -> Login '
                         + '(Password/Face) -> Election Selection -> Face Verification -> Candidate Selection -> '
                         + 'Vote Confirmation -> Blockchain Storage -> Receipt Generation -> Results Display.'))
    add_figure(doc, 'reg_flow.png', 'Figure 4.2: Voter Registration Flow Diagram')
    add_figure(doc, 'vote_flow.png', 'Figure 4.3: Vote Casting Flow Diagram')
    add_heading(doc, '4.3 Database Design', level=2)
    add_body_para(doc, 'The system uses MySQL with the following relational models:')
    db_models = [
        ('Voters', 'voter_id (PK), name, age, email_id, otp, otp_verified, is_verified, has_vote, is_staff'),
        ('Election', 'id (PK), name, description, start_date, end_date'),
        ('Candidate', 'id (PK), name, party, manifesto, election_id (FK)'),
        ('votes', 'id (PK), voter_id (FK), election_id (FK), candidate_id (FK), timestamp'),
        ('Block', 'id (PK), index, voter_id, candidate_id, timestamp, previous_hash, hash'),
    ]
    make_table(doc, ['Model', 'Fields'], db_models,
               col_widths=[Inches(1.2), Inches(5.3)])
    add_figure(doc, 'er_diagram.png', 'Figure 4.6: Entity-Relationship Diagram')
    add_heading(doc, '4.4 API Endpoints', level=2)
    api_data = [
        ('POST', '/api/users/register/', 'Voter registration'),
        ('POST', '/api/users/login/', 'JWT token generation'),
        ('POST', '/api/face/save-frames-batch/', 'Batch face frame upload'),
        ('POST', '/api/face/register-face/', 'Train model and finalize registration'),
        ('POST', '/api/face/recognize-frame/', 'Real-time face recognition'),
        ('GET', '/api/elections/election/', 'List all elections'),
        ('GET', '/api/elections/candidate/', 'List all candidates'),
        ('POST', '/api/votes/cast/', 'Cast a vote'),
        ('GET', '/api/votes/results/{id}/', 'Get election results'),
        ('GET', '/blockchain/', 'View blockchain ledger'),
        ('GET', '/blockchain/validate/', 'Validate chain integrity'),
    ]
    make_table(doc, ['Method', 'Endpoint', 'Description'], api_data,
               col_widths=[Inches(0.7), Inches(2.8), Inches(3.0)])
    add_heading(doc, '4.5 Use Case Diagram', level=2)
    add_body_para(doc, ('The use case diagram illustrates the interactions between the two primary actors '
                         + '(Voter and Admin) and the TrueVote system. Each actor has a distinct set of use cases '
                         + 'that define their interactions with the system.'))
    add_figure(doc, 'usecase_diagram.png', 'Figure 4.5: TrueVote Use Case Diagram')
    add_heading(doc, '4.6 Sequence Diagram - Vote Casting', level=2)
    add_body_para(doc, ('The vote casting sequence involves the following steps: The voter logs in using JWT '
                         + 'authentication. The frontend sends a face verification request to the backend. The AI '
                         + 'module processes the face frame and returns a recognition result. Upon successful '
                         + 'verification, the voter selects a candidate and confirms the vote. The backend creates '
                         + 'a vote record, computes the SHA-256 hash, adds a new block to the blockchain, sets the '
                         + 'has_vote flag, and returns a cryptographic receipt to the voter.'))
    add_heading(doc, '4.7 Class Diagram', level=2)
    add_body_para(doc, ('The class diagram shows the five main Django models: Voters, Election, Candidate, votes, '
                         + 'and Block. The Voters model has a one-to-many relationship with votes. The Election model '
                         + 'has a one-to-many relationship with both Candidate and votes. The votes model has a '
                         + 'one-to-one relationship with Block, representing the blockchain record of each vote.'))
    add_figure(doc, 'blockchain_diagram.png', 'Figure 4.4: TrueVote Blockchain Structure')
    doc.add_page_break()

def add_chapter5(doc):
    add_heading(doc, 'CHAPTER 5: RESULTS ANALYSIS AND VALIDATION', level=1)
    add_heading(doc, '5.1 Implementation of Solution', level=2)
    add_body_para(doc, ('The TrueVote system was successfully implemented as a full-stack web application. The '
                         + 'backend Django application exposes RESTful API endpoints consumed by the React.js '
                         + 'frontend. The blockchain module maintains a chain of vote blocks, each containing the '
                         + 'voter ID, candidate ID, timestamp, previous hash, and current SHA-256 hash. The AI '
                         + 'module uses OpenCV' + chr(39) + 's LBPH face recognizer trained on 15-20 face frames per voter.'))
    add_body_para(doc, ('The voter registration process involves a multi-step form with OTP email verification '
                         + 'followed by webcam-based face capture. The face frames are sent to the backend in batches, '
                         + 'where duplicate face detection is performed using cosine similarity of LBPH histograms. '
                         + 'If no duplicate is detected, the LBPH model is trained and saved. During voting, the '
                         + 'voter' + chr(39) + 's face is verified in real-time before allowing vote casting.'))
    add_heading(doc, '5.2 System Screenshots Description', level=2)
    screens = [
        ('Registration Page', 'Multi-step form with OTP verification and webcam face capture interface'),
        ('Login Page', 'Voter ID/password form with Login with Face option'),
        ('Elections Page', 'Cards showing active elections with status badges'),
        ('Vote Page', 'Three-step flow: face verify, candidate select, confirmation modal'),
        ('Results Page', 'Bar charts and pie charts with live vote counts using Recharts'),
        ('Blockchain Page', 'Block explorer showing all vote blocks with hashes and timestamps'),
        ('Admin Dashboard', 'Election management, candidate registration, blockchain validation'),
    ]
    make_table(doc, ['Screen', 'Description'], screens,
               col_widths=[Inches(1.8), Inches(4.7)])
    add_heading(doc, '5.3 Performance Evaluation', level=2)
    perf_data = [
        ('Face Registration (Model Training)', '~3000 ms', 'Acceptable for one-time operation'),
        ('Face Recognition (Per Frame)', '~225 ms', 'Real-time capable'),
        ('Vote Casting (End-to-End)', '~4500 ms', 'Includes face verify + blockchain'),
        ('SHA-256 Hash Computation', '~1 ms', 'Negligible overhead'),
        ('Blockchain Chain Validation', '~10 ms', 'Fast for current scale'),
        ('Results Page Load', '~500 ms', 'Includes DB aggregation'),
    ]
    make_table(doc, ['Operation', 'Time', 'Notes'], perf_data,
               col_widths=[Inches(2.5), Inches(1.0), Inches(3.0)])
    add_figure(doc, 'performance_chart.png', 'Figure 5.1: TrueVote System Performance Metrics')
    add_heading(doc, '5.4 Validation Test Cases', level=2)
    test_data = [
        ('TC-01', 'Valid voter registration with OTP', 'Voter registered, OTP sent', 'Voter created in DB', 'PASS'),
        ('TC-02', 'Duplicate face registration attempt', 'Same face submitted twice', 'Registration denied', 'PASS'),
        ('TC-03', 'Face login with registered voter', 'Correct face presented', 'JWT token issued', 'PASS'),
        ('TC-04', 'Vote casting with face verification', 'Face verified, candidate selected', 'Vote + Block created', 'PASS'),
        ('TC-05', 'Double voting prevention', 'Voter tries to vote twice', 'Error: Already voted', 'PASS'),
        ('TC-06', 'Blockchain integrity validation', 'Chain validate endpoint called', 'Chain valid: True', 'PASS'),
        ('TC-07', 'Fraud detection - rapid voting', 'Multiple votes in short window', 'Fraud flag raised', 'PASS'),
        ('TC-08', 'Results display accuracy', '10 votes cast for candidates', 'Correct counts shown', 'PASS'),
    ]
    make_table(doc, ['Test ID', 'Test Case', 'Input', 'Expected Output', 'Result'], test_data,
               col_widths=[Inches(0.7), Inches(1.8), Inches(1.5), Inches(1.5), Inches(0.8)])
    add_figure(doc, 'test_results.png', 'Figure 5.2: Validation Test Results (8 Scenarios)')
    add_heading(doc, '5.5 Challenges and Solutions', level=2)
    challenges = [
        ('Face recognition accuracy in varying lighting', 'Implemented histogram equalization and captured frames under different lighting conditions'),
        ('Blockchain performance at scale', 'Optimized hash computation and used indexed DB queries for chain traversal'),
        ('CORS issues between React and Django', 'Configured django-cors-headers with specific allowed origins'),
        ('JWT token expiry handling', 'Implemented refresh token mechanism with automatic re-authentication'),
        ('Duplicate face detection false positives', 'Tuned cosine similarity threshold through empirical testing'),
    ]
    make_table(doc, ['Challenge', 'Solution'], challenges,
               col_widths=[Inches(2.5), Inches(4.0)])
    doc.add_page_break()
