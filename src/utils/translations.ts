import { AppLanguage, QuestionResponseValue, CorrectiveActionStatus, VerificationStatus } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  citizenMode: string;
  auditorMode: string;
  homeTab: string;
  auditTab: string;
  mapTab: string;
  assistTab: string;
  findAPlace: string;
  findAPlaceDesc: string;
  iNeedHelp: string;
  iNeedHelpDesc: string;
  checkABuilding: string;
  checkABuildingDesc: string;
  reportProblem: string;
  reportProblemDesc: string;
  remediationLabel: string;
  checkAgain: string;
  previousChecks: string;
  waitingForCheck: string;
  severityLabel: string;
  whatDoesThisMean: string;
  startNewAudit: string;
  registerNewBuilding: string;
  saveDraft: string;
  resumeDraft: string;
  cancelAudit: string;
  publishAudit: string;
  publishReaudit: string;
  scoringMethod: string;
  voiceAssistance: string;
  readAloud: string;
  stopVoice: string;
  voiceInput: string;
  listening: string;
  language: string;
  totalAudited: string;
  avgScore: string;
  urgentNeeds: string;
  resolvedIssues: string;
  criticalBarriers: string;
  recentActivity: string;
  provisionalScoreNotice: string;
  options: Record<QuestionResponseValue, { label: string; explanation: string }>;
  priorities: Record<'high' | 'medium' | 'low', string>;
  actionStatuses: Record<CorrectiveActionStatus, string>;
  verificationLabels: Record<VerificationStatus, string>;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  en: {
    appName: 'AccessGap',
    tagline: 'Making Public Spaces Accessible',
    citizenMode: 'Citizen Mode',
    auditorMode: 'Auditor & Manager Mode',
    homeTab: 'Home',
    auditTab: 'Check This Building',
    mapTab: 'Find a Place',
    assistTab: 'I Need Help',
    findAPlace: 'FIND A PLACE',
    findAPlaceDesc: 'Find public buildings and see their recorded accessibility information.',
    iNeedHelp: 'I NEED HELP',
    iNeedHelpDesc: 'Explore available assistance options and submit a request.',
    checkABuilding: 'CHECK A BUILDING',
    checkABuildingDesc: 'Start an accessibility inspection or continue a saved audit.',
    reportProblem: 'Report a Problem',
    reportProblemDesc: 'Report an inaccessible entrance, blocked ramp, or broken lift.',
    remediationLabel: 'How Can This Be Fixed?',
    checkAgain: 'Check Again',
    previousChecks: 'Previous Checks',
    waitingForCheck: 'Waiting for Another Check',
    severityLabel: 'How Serious Is This Problem?',
    whatDoesThisMean: 'What does this mean?',
    startNewAudit: 'Start New Check',
    registerNewBuilding: 'Register New Building',
    saveDraft: 'Save Progress & Resume Later',
    resumeDraft: 'Resume Saved Audit Draft',
    cancelAudit: 'Cancel Check',
    publishAudit: 'Save & Publish Check',
    publishReaudit: 'Publish Verified Follow-Up Check',
    scoringMethod: 'Transparent Scoring Method',
    voiceAssistance: 'Voice Accessibility Assistant',
    readAloud: 'Read Question Aloud',
    stopVoice: 'Stop Speaking',
    voiceInput: 'Answer by Voice',
    listening: 'Listening for answer (say Yes, Partially, No, Skip, Next)...',
    language: 'Language',
    totalAudited: 'Total Buildings Checked',
    avgScore: 'Average Accessibility Score',
    urgentNeeds: 'Urgent Improvements Needed',
    resolvedIssues: 'Verified Resolved',
    criticalBarriers: 'Critical Access Barriers',
    recentActivity: 'Recent Activity',
    provisionalScoreNotice:
      'Provisional Prototype Score — Calculated from verified inspection checklist. Not a legal or engineering certification.',
    options: {
      yes: {
        label: 'Yes',
        explanation: 'Meets accessibility standard fully (100 points)',
      },
      partially: {
        label: 'Partially',
        explanation: 'Accessible with minor barriers or limitations (50 points)',
      },
      no: {
        label: 'No',
        explanation: 'Fails accessibility standard; significant physical barrier (0 points)',
      },
      not_applicable: {
        label: 'Not Applicable',
        explanation: 'Not present or not needed in this building (excluded from score)',
      },
      not_inspected: {
        label: 'Not Inspected',
        explanation: 'Skipped or uninspected question (counted as incomplete)',
      },
    },
    priorities: {
      high: 'High Priority (Blocking)',
      medium: 'Medium Priority (Difficult)',
      low: 'Low Priority (Inconvenient)',
    },
    actionStatuses: {
      reported: 'Reported',
      assigned: 'Assigned',
      in_progress: 'Work Started',
      awaiting_verification: 'Waiting for Another Check',
      verified_resolved: 'Verified Resolved',
    },
    verificationLabels: {
      verified: 'Verified',
      user_reported: 'User-reported',
      unknown: 'Unknown',
      needs_reinspection: 'Needs re-inspection',
      verified_audit: 'Verified',
      citizen_reported: 'User-reported',
      outdated: 'Needs re-inspection',
      demonstration_record: 'Demonstration Record',
    },
  },
  hi: {
    appName: 'एक्सेसगैप (AccessGap)',
    tagline: 'सार्वजनिक स्थानों को सुगम बनाना',
    citizenMode: 'नागरिक मोड',
    auditorMode: 'ऑडिटर व प्रबंधक मोड',
    homeTab: 'होम',
    auditTab: 'भवन की जांच करें',
    mapTab: 'स्थान खोजें',
    assistTab: 'मुझे सहायता चाहिए',
    findAPlace: 'स्थान खोजें',
    findAPlaceDesc: 'सार्वजनिक भवन खोजें और उनकी दर्ज सुलभता जानकारी देखें।',
    iNeedHelp: 'मुझे सहायता चाहिए',
    iNeedHelpDesc: 'उपलब्ध सहायता विकल्प देखें और अनुरोध दर्ज करें।',
    checkABuilding: 'भवन की जांच करें',
    checkABuildingDesc: 'सुलभता जांच शुरू करें या सहेजी गई जांच जारी रखें।',
    reportProblem: 'समस्या की रिपोर्ट करें',
    reportProblemDesc: 'अगम्य प्रवेश, अवरुद्ध रैंप या खराब लिफ्ट की रिपोर्ट करें।',
    remediationLabel: 'इसे कैसे ठीक किया जा सकता है?',
    checkAgain: 'पुनः जांचें',
    previousChecks: 'पिछली जांचें',
    waitingForCheck: 'अगली जांच की प्रतीक्षा में',
    severityLabel: 'यह समस्या कितनी गंभीर है?',
    whatDoesThisMean: 'इसका क्या अर्थ है?',
    startNewAudit: 'नई जांच शुरू करें',
    registerNewBuilding: 'नया भवन जोड़ें',
    saveDraft: 'प्रगति सहेजें और बाद में पूरा करें',
    resumeDraft: 'सहेजी गई जांच जारी रखें',
    cancelAudit: 'जांच रद्द करें',
    publishAudit: 'जांच सहेजें व प्रकाशित करें',
    publishReaudit: 'सत्यापित पुनः-जांच सहेजें',
    scoringMethod: 'पारदर्शी स्कोरिंग पद्धति',
    voiceAssistance: 'ध्वनि सहायता सहायक',
    readAloud: 'प्रश्न को बोलकर सुनें',
    stopVoice: 'आवाज़ बंद करें',
    voiceInput: 'आवाज़ से उत्तर दें',
    listening: 'सुन रहा है (हाँ, आंशिक, नहीं बोलें)...',
    language: 'भाषा',
    totalAudited: 'कुल जांचे गए भवन',
    avgScore: 'औसत सुलभता स्कोर',
    urgentNeeds: 'तत्काल सुधार की आवश्यकता',
    resolvedIssues: 'सत्यापित हल की गई बाधाएं',
    criticalBarriers: 'गंभीर सुलभता बाधाएं',
    recentActivity: 'हाल की गतिविधि',
    provisionalScoreNotice:
      'प्रारूप स्कोर — भौतिक निरीक्षण चेकलिस्ट से गणितीय रूप से आकलित। यह कानूनी प्रमाण पत्र नहीं है।',
    options: {
      yes: {
        label: 'हाँ',
        explanation: 'मानक का पूरी तरह पालन करता है (100 अंक)',
      },
      partially: {
        label: 'आंशिक रूप से',
        explanation: 'मामूली बाधाओं के साथ सुलभ (50 अंक)',
      },
      no: {
        label: 'नहीं',
        explanation: 'गंभीर भौतिक बाधा मौजूद है (0 अंक)',
      },
      not_applicable: {
        label: 'लागू नहीं',
        explanation: 'इस भवन में लागू नहीं (गणना से बाहर)',
      },
      not_inspected: {
        label: 'निरीक्षण नहीं किया',
        explanation: 'छोड़ा गया प्रश्न (अपूर्ण के रूप में गिना जाता है)',
      },
    },
    priorities: {
      high: 'उच्च प्राथमिकता (अवरोधक)',
      medium: 'मध्यम प्राथमिकता (कठिन)',
      low: 'निम्न प्राथमिकता',
    },
    actionStatuses: {
      reported: 'दर्ज समस्या',
      assigned: 'सौंपा गया',
      in_progress: 'कार्य शुरू हुआ',
      awaiting_verification: 'जांच की प्रतीक्षा में',
      verified_resolved: 'सत्यापित हल',
    },
    verificationLabels: {
      verified: 'सत्यापित',
      user_reported: 'उपयोगकर्ता-दर्ज',
      unknown: 'अज्ञात',
      needs_reinspection: 'पुनः जांच आवश्यक',
      verified_audit: 'सत्यापित',
      citizen_reported: 'उपयोगकर्ता-दर्ज',
      outdated: 'पुनः जांच आवश्यक',
      demonstration_record: 'प्रारूप रिकॉर्ड',
    },
  },
  mr: {
    appName: 'ॲक्सेसगॅप (AccessGap)',
    tagline: 'सार्वजनिक जागा सुलभ करणे',
    citizenMode: 'नागरिक मोड',
    auditorMode: 'ऑडिटर व व्यवस्थापक मोड',
    homeTab: 'मुख्यपृष्ठ',
    auditTab: 'इमारत तपासा',
    mapTab: 'जागा शोधा',
    assistTab: 'मला मदत हवी आहे',
    findAPlace: 'जागा शोधा',
    findAPlaceDesc: 'सार्वजनिक इमारती शोधा आणि त्यांची नोंदवलेली सुलभता माहिती पहा.',
    iNeedHelp: 'मला मदत हवी आहे',
    iNeedHelpDesc: 'उपलब्ध मदत पर्याय पहा आणि विनंती नोंदवा.',
    checkABuilding: 'इमारत तपासा',
    checkABuildingDesc: 'सुलभता तपासणी सुरू करा किंवा जतन केलेली तपासणी सुरू ठेवा.',
    reportProblem: 'अडचणीची नोंद करा',
    reportProblemDesc: 'अडथळा, बंद रॅम्प किंवा बंद लिफ्टची नोंद करा.',
    remediationLabel: 'हे कसे सुधारता येईल?',
    checkAgain: 'पुन्हा तपासा',
    previousChecks: 'मागील तपासण्या',
    waitingForCheck: 'पुढील तपासणी प्रलंबित',
    severityLabel: 'ही अडचण किती गंभीर आहे?',
    whatDoesThisMean: 'याचा काय अर्थ आहे?',
    startNewAudit: 'नवीन तपासणी सुरू करा',
    registerNewBuilding: 'नवीन इमारत जोडा',
    saveDraft: 'मसुदा जतन करा',
    resumeDraft: 'जतन केलेले ऑडिट उघडा',
    cancelAudit: 'तपासणी रद्द करा',
    publishAudit: 'तपासणी प्रकाशित करा',
    publishReaudit: 'पुनः-तपासणी जतन करा',
    scoringMethod: 'पारदर्शक गुण पद्धती',
    voiceAssistance: 'ध्वनी सहाय्यक',
    readAloud: 'मोठ्याने वाचा',
    stopVoice: 'आवाज थांबवा',
    voiceInput: 'आवाजाने उत्तर द्या',
    listening: 'ऐकत आहे (होय, अंशतः, नाही म्हणा)...',
    language: 'भाषा',
    totalAudited: 'एकूण तपासलेल्या इमारती',
    avgScore: 'सरासरी सुलभता गुण',
    urgentNeeds: 'तातडीच्या सुधारणा आवश्यक',
    resolvedIssues: 'निवारण झालेल्या अडचणी',
    criticalBarriers: 'गंभीर सुलभता अडचणी',
    recentActivity: 'अलीकडील नोंद',
    provisionalScoreNotice:
      'प्रारूप गुण — भौतिक तपासणीवरून गणितीय पद्धतीने मोजलेले. हे कायदेशीर प्रमाणपत्र नाही.',
    options: {
      yes: {
        label: 'होय',
        explanation: 'मानक पूर्णपणे पाळले आहे (100 गुण)',
      },
      partially: {
        label: 'अंशतः',
        explanation: 'काही अडचणींसह सुलभ (50 गुण)',
      },
      no: {
        label: 'नाही',
        explanation: 'गंभीर भौतिक अडथळा (0 गुण)',
      },
      not_applicable: {
        label: 'लागू नाही',
        explanation: 'या इमारतीस लागू नाही (गणना वगळली)',
      },
      not_inspected: {
        label: 'तपासले नाही',
        explanation: 'वगळलेला प्रश्न (अपूर्ण मानला जातो)',
      },
    },
    priorities: {
      high: 'उच्च प्राधान्य (अडथळा)',
      medium: 'मध्यम प्राधान्य (कठीण)',
      low: 'कमी प्राधान्य',
    },
    actionStatuses: {
      reported: 'नोंदवलेली अडचण',
      assigned: 'नियुक्त केले',
      in_progress: 'काम चालू झाले',
      awaiting_verification: 'तपासणी प्रलंबित',
      verified_resolved: 'पडताळणी पूर्ण',
    },
    verificationLabels: {
      verified: 'सत्यापित',
      user_reported: 'वापरकर्ता नोंद',
      unknown: 'अज्ञात',
      needs_reinspection: 'पुनर्तपासणी आवश्यक',
      verified_audit: 'सत्यापित',
      citizen_reported: 'वापरकर्ता नोंद',
      outdated: 'पुनर्तपासणी आवश्यक',
      demonstration_record: 'प्रात्यक्षिक नोंद',
    },
  },
};

export const QUESTION_TRANSLATIONS_HI: Record<
  string,
  { question: string; description: string; whyItMatters: string }
> = {
  q_entrance_stepfree: {
    question: 'क्या मुख्य प्रवेश द्वार सीढ़ी-मुक्त (स्टेप-फ्री) है?',
    description: 'प्रवेश द्वार का तल फर्श के बराबर होना चाहिए या अधिकतम 13 मिमी ढालू किनारा होना चाहिए, बिना किसी एकल सीढ़ी के।',
    whyItMatters: 'एकल सीढ़ी भी व्हीलचेयर उपयोगकर्ताओं का मार्ग पूरी तरह रोक देती है और छड़ी का उपयोग करने वालों के लिए गिरने का खतरा पैदा करती है।',
  },
  q_entrance_ramp: {
    question: 'क्या आवश्यकता पड़ने पर उपयुक्त रैंप उपलब्ध है?',
    description: 'जहाँ स्तर प्रवेश संभव नहीं है, वहाँ 1:12 से अधिक तीव्र न होने वाला रैंप, दोनों तरफ निरंतर रेलिंग और विश्राम स्थल उपलब्ध होना चाहिए।',
    whyItMatters: 'अत्यधिक तीव्र ढाल वाले रैंप से व्हीलचेयर पीछे पलटने का गंभीर जोखिम रहता है और रेलिंग के बिना गिरने का खतरा होता है।',
  },
  q_entrance_width: {
    question: 'क्या प्रवेश द्वार व्हीलचेयर प्रवेश के लिए पर्याप्त चौड़ा है?',
    description: 'दरवाजे 90 डिग्री खुलने पर कम से कम 850 मिमी की स्पष्ट चौड़ाई प्रदान करते हों।',
    whyItMatters: 'संकीर्ण दरवाजे बिजली से चलने वाली व्हीलचेयर, बच्चों की गाड़ियों या आपातकालीन स्ट्रेचर को रोक देते हैं।',
  },
  q_entrance_route: {
    question: 'क्या प्रवेश मार्ग प्रमुख बाधाओं से मुक्त है?',
    description: 'मार्ग समतल, पक्का और गड्ढों, बिखरी बजरी, खड़ी साइकिलों या खंभों से मुक्त होना चाहिए।',
    whyItMatters: 'टूटे हुए रास्ते और अवरोध दिव्यांग नागरिकों को असुरक्षित सड़कों पर चलने के लिए मजबूर करते हैं।',
  },
  q_internal_pathways: {
    question: 'क्या आंतरिक गलियारे और रास्ते सुलभ हैं?',
    description: 'मुख्य सार्वजनिक गलियारों में कम से कम 1200 मिमी की निरंतर निर्बाध चौड़ाई होनी चाहिए।',
    whyItMatters: 'बक्से या संकीर्ण रास्तों से भीड़भाड़ होती है और आपातकालीन निकास के दौरान नागरिक फंस सकते हैं।',
  },
  q_internal_wheelchair_flow: {
    question: 'क्या व्हीलचेयर उपयोगकर्ता पूरे भवन में सुगमता से घूम सकते हैं?',
    description: 'सार्वजनिक काउंटरों, प्रतीक्षा क्षेत्रों और बैठक कक्षों के बीच कोई आंतरिक सीढ़ी की बाधा न हो।',
    whyItMatters: 'आंतरिक सीढ़ियों के कारण नागरिक सार्वजनिक काउंटरों तक नहीं पहुँच पाते।',
  },
  q_internal_lift: {
    question: 'क्या बहुमंजिला भवन में आवश्यक लिफ्ट उपलब्ध और कार्यशील है?',
    description: 'कम से कम 1100 मिमी x 1400 मिमी आयाम वाली लिफ्ट, ब्रेल बटन और ऑडियो घोषणा के साथ उपलब्ध हो।',
    whyItMatters: 'लिफ्ट न होने पर ऊपरी मंजिल के सरकारी कार्यालय दिव्यांग नागरिकों के लिए पूरी तरह दुर्गम हो जाते हैं।',
  },
  q_internal_routes_identified: {
    question: 'क्या सुलभ रास्तों की स्पष्ट पहचान और संकेत लगे हैं?',
    description: 'रैंप, लिफ्ट और सुलभ शौचालयों की दिशा दर्शाने वाले स्पष्ट संकेत लगे हों।',
    whyItMatters: 'संकेत न होने पर बुजुर्गों और शारीरिक रूप से अक्षम लोगों को अनावश्यक भटकना पड़ता है।',
  },
  q_facility_toilet_available: {
    question: 'क्या सुलभ शौचालय (Accessible Toilet) उपलब्ध है?',
    description: 'सुलभ रास्ते पर स्पष्ट संकेत के साथ कम से कम एक समर्पित सुलभ शौचालय उपलब्ध हो।',
    whyItMatters: 'शौचालय न होने पर नागरिक सरकारी दफ्तरों में घंटों प्रतीक्षा या काम पूरा नहीं कर पाते।',
  },
  q_facility_toilet_space: {
    question: 'क्या शौचालय के अंदर मुड़ने और घूमने के लिए पर्याप्त जगह है?',
    description: 'शौचालय के अंदर कम से कम 1500 मिमी व्यास का खुला गोलाकार स्थान होना चाहिए।',
    whyItMatters: 'तंग स्थान में व्हीलचेयर मुड़ नहीं सकती और सीट तक स्थानांतरण असंभव हो जाता है।',
  },
  q_facility_reachable: {
    question: 'क्या आवश्यक सुविधाएं (काउंटर, नल, बटन) पहुँच योग्य हैं?',
    description: 'पीने का पानी, सर्विस काउंटर, ग्रैब बार और आपातकालीन घंटी 700-1100 मिमी की सुलभ ऊंचाई पर हों।',
    whyItMatters: 'ऊंचे काउंटर व्हीलचेयर उपयोगकर्ताओं के लिए संवाद और गोपनीयता में बाधा बनते हैं।',
  },
  q_signage_easy: {
    question: 'क्या संकेत और बोर्ड समझने में आसान हैं?',
    description: 'संकेत उच्च रंग कंट्रास्ट (70%+), बिना चमक वाले और स्पष्ट अक्षरों एवं प्रतीकों में हों।',
    whyItMatters: 'कम कंट्रास्ट वाले बोर्ड दृष्टिबाधित और बुजुर्ग नागरिकों के लिए भ्रम पैदा करते हैं।',
  },
  q_signage_directional: {
    question: 'क्या दिशात्मक जानकारी स्पष्ट रूप से दिखाई देती है?',
    description: 'संकेत सामान्य आँख के स्तर (1200-1600 मिमी) पर प्रमुख मोड़ों पर लगाए गए हों।',
    whyItMatters: 'सही दिशा-निर्देश न होने पर नागरिकों को बार-बार दूसरों पर निर्भर रहना पड़ता है।',
  },
  q_signage_accessible_formats: {
    question: 'क्या महत्वपूर्ण जानकारी सुलभ प्रारूपों (ब्रेल, ऑडियो) में उपलब्ध है?',
    description: 'कमरों के नाम और लिफ्ट बटन में ब्रेल और उभरे हुए अक्षर हों; बड़े प्रिंट वाले नोटिस उपलब्ध हों।',
    whyItMatters: 'ब्रेल या ऑडियो के बिना दृष्टिबाधित व्यक्ति स्वतंत्र रूप से आवश्यक विभाग नहीं खोज सकते।',
  },
  q_signage_assistance: {
    question: 'क्या जरूरतमंद लोगों के लिए मानवीय सहायता उपलब्ध है?',
    description: 'पूछताछ काउंटर, हियरिंग लूप या प्रशिक्षित सहायता कर्मचारी उपलब्ध हों।',
    whyItMatters: 'श्रवण या वाक दिव्यांग नागरिकों को मानवीय सहायता की तत्काल आवश्यकता होती है।',
  },
  q_safety_hazards: {
    question: 'क्या रास्ते खतरनाक लटकती बाधाओं या फिसलन से मुक्त हैं?',
    description: 'फर्श से 675 से 2000 मिमी के बीच दीवार से 100 मिमी से अधिक बाहर निकली कोई बाधा न हो।',
    whyItMatters: 'दीवार से बाहर निकले लैंप या सीढ़ियों के नीचे का हिस्सा छड़ी उपयोग करने वाले दृष्टिबाधितों के सिर में चोट मार सकता है।',
  },
  q_safety_emergency_info: {
    question: 'क्या आपातकालीन निकास जानकारी सुलभ (ध्वनि व प्रकाश) है?',
    description: 'अलार्म में सायरन के साथ चमकती रोशनी (स्ट्रोब लाइट) और सुरक्षित शरण स्थल शामिल हों।',
    whyItMatters: 'केवल ध्वनि सायरन होने पर बधिर नागरिकों को आग लगने की आपात स्थिति का पता नहीं चलता।',
  },
  q_safety_general_navigation: {
    question: 'क्या विभिन्न दिव्यांगताओं वाले लोग भवन में सुरक्षित चल सकते हैं?',
    description: 'भवन की समग्र व्यवस्था सभी आयु वर्ग और क्षमताओं के लोगों के लिए सुरक्षित और गरिमापूर्ण हो।',
    whyItMatters: 'सार्वजनिक सेवाएं समाज के प्रत्येक नागरिक के लिए सुरक्षित और समावेशी होनी चाहिए।',
  },
};
