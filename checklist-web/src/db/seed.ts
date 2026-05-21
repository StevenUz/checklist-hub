import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const DATA_BACKUP_VERIFICATION_CHECKLIST = [
  {
    title: "Backup Verification Planning",
    items: [
      "Define backup verification schedule",
      "Identify critical systems and data to verify",
      "Review backup policies and retention requirements",
      "Assign backup verification responsibilities",
      "Prepare verification documentation and logs",
      "Confirm access permissions for backup systems",
      "Identify recovery time objectives (RTO)",
      "Identify recovery point objectives (RPO)",
      "Prepare incident escalation procedures",
      "Review previous backup verification reports",
    ],
  },
  {
    title: "Backup Availability Checks",
    items: [
      "Verify latest backups completed successfully",
      "Confirm backup jobs ran on schedule",
      "Check backup status notifications and alerts",
      "Ensure backup files are accessible",
      "Verify backup storage locations",
      "Confirm offsite or cloud backups are available",
      "Check backup file sizes for anomalies",
      "Review backup logs for warnings or errors",
      "Verify incremental and full backups exist as expected",
      "Confirm retention policies are applied correctly",
    ],
  },
  {
    title: "Backup Integrity Verification",
    items: [
      "Validate backup file integrity checksums",
      "Confirm backups are not corrupted",
      "Test backup encryption and decryption if applicable",
      "Verify database backup consistency",
      "Check archive and compression integrity",
      "Inspect backup media for physical damage if applicable",
      "Confirm backup metadata accuracy",
      "Verify backup timestamps and versions",
      "Test snapshot integrity if using snapshots",
      "Review backup validation reports",
    ],
  },
  {
    title: "Restore Testing",
    items: [
      "Perform test restore of critical files",
      "Restore sample databases in test environment",
      "Verify restored files open correctly",
      "Confirm restored applications function properly",
      "Test recovery of user accounts and permissions",
      "Validate restoration of configuration files",
      "Test virtual machine or container recovery if applicable",
      "Verify restore speed meets recovery objectives",
      "Ensure restored data matches original data",
      "Document restore test results",
    ],
  },
  {
    title: "Database Backup Verification",
    items: [
      "Confirm successful database backup completion",
      "Test database restore procedure",
      "Verify transaction log backups if applicable",
      "Check database replication and synchronization",
      "Validate database integrity after restore",
      "Confirm schema and data consistency",
      "Review database backup storage usage",
      "Test point-in-time recovery if applicable",
      "Verify backup automation scripts",
      "Confirm database backup retention policies",
    ],
  },
  {
    title: "Cloud and Offsite Backup Verification",
    items: [
      "Verify cloud backup synchronization status",
      "Confirm remote backup access permissions",
      "Test cloud restore functionality",
      "Check bandwidth and transfer performance",
      "Review cloud backup costs and storage usage",
      "Verify geographic redundancy if required",
      "Confirm backup provider service status",
      "Test multi-region or multi-cloud recovery if applicable",
      "Review offsite backup encryption and security",
    ],
  },
  {
    title: "Security and Compliance Checks",
    items: [
      "Verify backup encryption is enabled",
      "Review access permissions to backup systems",
      "Confirm backups are protected from ransomware risks",
      "Check audit logs for unauthorized access attempts",
      "Verify compliance with data retention regulations",
      "Confirm secure transfer protocols are used",
      "Test backup access authentication mechanisms",
      "Review disaster recovery documentation",
      "Ensure backup media is stored securely",
      "Verify compliance reporting requirements",
    ],
  },
  {
    title: "Monitoring and Automation",
    items: [
      "Verify backup monitoring systems are operational",
      "Test backup failure alerts and notifications",
      "Confirm automated backup scripts function correctly",
      "Review monitoring dashboards for anomalies",
      "Verify scheduled verification tasks run successfully",
      "Test logging and reporting systems",
      "Ensure backup storage thresholds are monitored",
      "Validate automation for backup cleanup and retention",
      "Review backup performance metrics",
    ],
  },
  {
    title: "Documentation and Reporting",
    items: [
      "Update backup verification logs",
      "Record failed or incomplete backups",
      "Document restore test outcomes",
      "Review backup inventory and storage locations",
      "Update disaster recovery documentation",
      "Prepare summary report for stakeholders",
      "Track remediation actions for identified issues",
      "Schedule follow-up verification if needed",
      "Archive verification reports securely",
      "Plan next backup verification cycle",
    ],
  },
  {
    title: "Final Review",
    items: [
      "Confirm all critical systems are covered by backups",
      "Verify recovery objectives are achievable",
      "Ensure no unresolved backup failures remain",
      "Review overall backup reliability and performance",
      "Confirm backup verification tasks are completed",
      "Notify responsible teams of verification results",
      "Approve backup readiness status",
      "Maintain continuous backup monitoring",
      "Review lessons learned and improvement opportunities",
      "Prepare for future disaster recovery testing",
    ],
  },
] as const;

async function seedDataBackupVerificationTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Operations",
      slug: "operations",
      description: "Checklist templates for operational processes and maintenance.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Operations",
        description: "Checklist templates for operational processes and maintenance.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Data Backup Verification",
      slug: "data-backup-verification",
      description: "Checklist for verifying backup availability, integrity, and restores.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Data Backup Verification",
        description: "Checklist for verifying backup availability, integrity, and restores.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Data Backup Verification Checklist",
      slug: "data-backup-verification-checklist",
      description: "A checklist to verify backups, integrity, restores, and compliance.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Data Backup Verification Checklist",
        description: "A checklist to verify backups, integrity, restores, and compliance.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of DATA_BACKUP_VERIFICATION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}


import { db } from ".";
import {
  activities,
  categories,
  checklistTemplates,
  templateItems,
  templateSections,
  users,
} from "./schema";

const SCUBA_CHECKLIST = [
  {
    title: "Personal Readiness",
    items: [
      "Verify diving certification card is valid and available",
      "Confirm diving insurance (if required)",
      "Assess personal health and fitness condition",
      "Stay hydrated before diving",
      "Avoid alcohol before the dive",
      "Get adequate sleep before the dive",
      "Review dive plan and emergency procedures",
      "Check weather and sea conditions",
      "Confirm dive site location and access",
      "Inform someone about your dive schedule",
    ],
  },
  {
    title: "Dive Gear Preparation",
    items: [
      "Inspect wetsuit / drysuit condition",
      "Check mask and snorkel",
      "Test fins and straps",
      "Inspect BCD (Buoyancy Control Device)",
      "Check regulator functionality",
      "Verify alternate air source",
      "Test pressure gauges/computer",
      "Inspect air tank condition and pressure",
      "Verify tank valve operation",
      "Check weight system and quick-release mechanism",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Pack dive computer",
      "Bring surface marker buoy (SMB)",
      "Carry dive knife or cutting tool",
      "Bring underwater flashlight if needed",
      "Pack whistle or signaling device",
      "Prepare first aid kit",
      "Confirm emergency oxygen availability",
      "Carry waterproof communication device if applicable",
    ],
  },
  {
    title: "Before Entering Water",
    items: [
      "Assemble full equipment setup",
      "Perform buddy equipment check",
      "Confirm air supply levels",
      "Secure all straps and hoses",
      "Activate dive computer",
      "Review hand signals with buddy",
      "Confirm maximum depth and bottom time",
      "Verify entry and exit procedures",
      "Check current and visibility conditions",
      "Confirm emergency meeting point",
    ],
  },
  {
    title: "During the Dive",
    items: [
      "Monitor air consumption regularly",
      "Maintain buddy contact",
      "Monitor depth and no-decompression limits",
      "Maintain neutral buoyancy",
      "Avoid rapid ascents",
      "Watch for environmental hazards",
      "Follow planned route and time limits",
      "Perform safety stop before surfacing",
    ],
  },
  {
    title: "After the Dive",
    items: [
      "Log dive details",
      "Rinse and clean equipment",
      "Inspect equipment for damage",
      "Store gear properly",
      "Rehydrate and rest",
      "Monitor for signs of decompression sickness",
      "Recharge dive computer/flashlights if needed",
      "Review dive performance and issues",
      "Upload dive photos/videos if applicable",
      "Plan surface interval before next dive",
    ],
  },
] as const;

const HOME_RENOVATION_CHECKLIST = [
  {
    title: "Renovation Planning",
    items: [
      "Define renovation goals and priorities",
      "Set renovation budget",
      "Create renovation timeline",
      "Identify rooms or areas to renovate",
      "Research design ideas and inspiration",
      "Prepare list of required materials",
      "Determine DIY vs professional work",
      "Review local building regulations and permits",
      "Prepare contingency budget for unexpected costs",
      "Assign responsibilities if multiple people are involved",
    ],
  },
  {
    title: "Design and Preparation",
    items: [
      "Finalize renovation design and layout",
      "Measure rooms and spaces accurately",
      "Select colors, finishes, and materials",
      "Prepare floor plans if needed",
      "Confirm furniture and appliance dimensions",
      "Order materials and supplies in advance",
      "Schedule contractor consultations if required",
      "Plan temporary living arrangements if necessary",
      "Protect valuable belongings and furniture",
      "Prepare storage space for removed items",
    ],
  },
  {
    title: "Permits and Contractor Management",
    items: [
      "Apply for required permits",
      "Verify contractor licenses and insurance",
      "Review contracts and payment schedules",
      "Confirm renovation start and completion dates",
      "Schedule inspections if required",
      "Prepare communication plan with contractors",
      "Keep copies of all agreements and receipts",
      "Verify warranties for materials and labor",
      "Ensure access to property for workers",
    ],
  },
  {
    title: "Demolition and Site Preparation",
    items: [
      "Remove furniture and personal belongings",
      "Cover floors and unaffected areas",
      "Disconnect utilities if necessary",
      "Remove old fixtures or materials safely",
      "Dispose of demolition waste properly",
      "Check for hidden issues (mold, water damage, wiring)",
      "Prepare tools and safety equipment",
      "Ensure proper ventilation during work",
      "Label electrical and plumbing connections if needed",
      "Secure work area from children or pets",
    ],
  },
  {
    title: "Structural and Utility Work",
    items: [
      "Inspect walls, ceilings, and floors",
      "Repair or reinforce structural elements if needed",
      "Upgrade electrical wiring if necessary",
      "Inspect plumbing systems",
      "Install or repair insulation",
      "Verify HVAC system compatibility",
      "Replace damaged windows or doors",
      "Confirm proper drainage and waterproofing",
      "Test utility connections after work",
      "Schedule professional inspections where required",
    ],
  },
  {
    title: "Flooring and Surface Installation",
    items: [
      "Prepare subfloor or wall surfaces",
      "Install flooring materials",
      "Paint walls and ceilings",
      "Install tiles or backsplashes",
      "Apply trim and molding",
      "Verify level and alignment of installations",
      "Allow proper drying and curing time",
      "Clean surfaces after installation",
      "Inspect finishes for defects or damage",
      "Protect newly finished surfaces",
    ],
  },
  {
    title: "Kitchen and Bathroom Renovation (if applicable)",
    items: [
      "Install cabinets and countertops",
      "Test plumbing fixtures and connections",
      "Install sinks, faucets, and appliances",
      "Verify ventilation systems",
      "Install lighting fixtures",
      "Check waterproofing in wet areas",
      "Test all appliances and utilities",
      "Inspect storage functionality",
      "Seal countertops, grout, or surfaces if needed",
      "Confirm proper drainage and water flow",
    ],
  },
  {
    title: "Electrical and Lighting",
    items: [
      "Install or replace outlets and switches",
      "Test all electrical circuits",
      "Install lighting fixtures",
      "Verify breaker panel labeling",
      "Test smoke and carbon monoxide detectors",
      "Organize cable and wiring management",
      "Confirm smart home systems if applicable",
      "Ensure compliance with electrical safety standards",
      "Test backup power systems if available",
    ],
  },
  {
    title: "Cleaning and Final Preparation",
    items: [
      "Remove dust and debris thoroughly",
      "Clean windows, floors, and surfaces",
      "Dispose of leftover materials safely",
      "Organize tools and unused supplies",
      "Inspect renovated areas carefully",
      "Touch up paint or finishes if needed",
      "Reinstall furniture and decorations",
      "Verify all systems and appliances work correctly",
      "Test doors, locks, and windows",
      "Prepare final renovation checklist review",
    ],
  },
  {
    title: "Safety and Maintenance",
    items: [
      "Inspect fire extinguishers and safety systems",
      "Review emergency exits and accessibility",
      "Check for sharp edges or hazards",
      "Verify proper ventilation and air quality",
      "Store chemicals and tools safely",
      "Review maintenance instructions for new materials",
      "Schedule future maintenance tasks",
      "Keep warranty documents organized",
      "Monitor renovated areas for issues after completion",
      "Update home insurance information if necessary",
    ],
  },
  {
    title: "After Renovation Completion",
    items: [
      "Conduct final walkthrough inspection",
      "Confirm contractor punch-list items are completed",
      "Save receipts and renovation documentation",
      "Take photos of completed renovation",
      "Review overall project budget and expenses",
      "Leave reviews for contractors if desired",
      "Organize leftover materials for future repairs",
      "Celebrate completion of the renovation",
      "Plan ongoing cleaning and maintenance routines",
      "Enjoy the renovated home space",
    ],
  },
] as const;

async function seedHomeRenovationTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Home",
      slug: "home",
      description: "Checklist templates for home tasks, maintenance, and routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Home",
        description: "Checklist templates for home tasks, maintenance, and routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Home Renovation",
      slug: "home-renovation",
      description: "Planning and execution checklist for home renovation projects.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Home Renovation",
        description: "Planning and execution checklist for home renovation projects.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Home Renovation Checklist",
      slug: "home-renovation-checklist",
      description: "Comprehensive checklist to guide planning, construction, and finishing of home renovations.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Home Renovation Checklist",
        description: "Comprehensive checklist to guide planning, construction, and finishing of home renovations.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of HOME_RENOVATION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

const SERVER_MAINTENANCE_CHECKLIST = [
  {
    title: "Maintenance Planning",
    items: [
      "Define maintenance scope and objectives",
      "Schedule maintenance window",
      "Notify affected users or teams",
      "Review previous maintenance logs and issues",
      "Prepare rollback or recovery plan",
      "Assign maintenance responsibilities",
      "Verify access credentials and permissions",
      "Confirm backup and recovery procedures",
      "Prepare communication channels for incidents",
      "Ensure emergency contacts are available",
    ],
  },
  {
    title: "Backup and Recovery",
    items: [
      "Verify recent system backups completed successfully",
      "Perform manual backup if necessary",
      "Test backup integrity and restore process",
      "Confirm database backups are current",
      "Back up configuration files",
      "Verify offsite or cloud backup availability",
      "Document backup locations",
      "Ensure recovery tools are accessible",
      "Check disaster recovery readiness",
      "Confirm rollback plan is documented",
    ],
  },
  {
    title: "Hardware Inspection",
    items: [
      "Inspect server hardware for physical damage",
      "Check server room temperature and ventilation",
      "Verify cooling systems are functioning",
      "Inspect power supplies and UPS systems",
      "Check cables and network connections",
      "Inspect storage drives for warnings or failures",
      "Verify RAID system health",
      "Clean dust from server equipment if needed",
      "Check server fans for proper operation",
      "Inspect physical security of server area",
    ],
  },
  {
    title: "Operating System Maintenance",
    items: [
      "Check system uptime and performance",
      "Install operating system updates and patches",
      "Verify kernel and system package updates",
      "Review system logs for errors or warnings",
      "Remove unnecessary temporary files",
      "Check disk usage and free space",
      "Verify time synchronization settings",
      "Restart services if required",
      "Confirm automatic update configurations",
      "Reboot server if necessary after updates",
    ],
  },
  {
    title: "Security Maintenance",
    items: [
      "Review user accounts and permissions",
      "Disable unused or inactive accounts",
      "Verify password policies",
      "Check firewall configurations",
      "Review security logs and alerts",
      "Verify antivirus or endpoint protection status",
      "Update security software and signatures",
      "Test intrusion detection/prevention systems",
      "Verify SSL certificates and expiration dates",
      "Confirm multi-factor authentication settings if applicable",
    ],
  },
  {
    title: "Network and Connectivity Checks",
    items: [
      "Test internet and network connectivity",
      "Verify DNS functionality",
      "Check VPN and remote access systems",
      "Test load balancers if applicable",
      "Verify network bandwidth usage",
      "Inspect open ports and active services",
      "Review routing and firewall rules",
      "Test failover systems if available",
      "Confirm monitoring and alerting systems work properly",
      "Validate external service connectivity",
    ],
  },
  {
    title: "Database Maintenance",
    items: [
      "Verify database service health",
      "Check database storage usage",
      "Review slow query logs",
      "Optimize or rebuild indexes if needed",
      "Test database replication if applicable",
      "Verify scheduled database jobs",
      "Clean old or unnecessary data if approved",
      "Confirm database backup completion",
      "Monitor database performance metrics",
      "Validate database integrity",
    ],
  },
  {
    title: "Application and Service Maintenance",
    items: [
      "Verify application services are running",
      "Restart services if needed",
      "Check API availability and response times",
      "Review application logs for errors",
      "Confirm scheduled jobs and background tasks are working",
      "Verify integrations with external systems",
      "Test authentication and user access",
      "Clear or refresh caches if necessary",
      "Confirm environment variables and configurations",
      "Validate service health endpoints",
    ],
  },
  {
    title: "Monitoring and Logging",
    items: [
      "Verify monitoring systems are operational",
      "Review CPU and memory usage trends",
      "Check storage and disk performance metrics",
      "Confirm alert notifications work correctly",
      "Review centralized logging systems",
      "Verify log rotation and retention policies",
      "Monitor unusual activity or spikes",
      "Test uptime monitoring services",
      "Confirm dashboards display accurate data",
      "Archive logs if required",
    ],
  },
  {
    title: "Performance Optimization",
    items: [
      "Analyze system resource usage",
      "Identify bottlenecks or performance issues",
      "Optimize startup or background services",
      "Review database query performance",
      "Test server response times",
      "Verify caching mechanisms",
      "Remove unnecessary applications or services",
      "Monitor network latency",
      "Tune server configurations if necessary",
      "Document optimization changes",
    ],
  },
  {
    title: "Final Verification",
    items: [
      "Perform post-maintenance system checks",
      "Verify all services are operational",
      "Test critical business functions",
      "Confirm users can access systems normally",
      "Review monitoring dashboards for issues",
      "Check logs for post-maintenance errors",
      "Validate backup systems after maintenance",
      "Notify users that maintenance is complete",
      "Update maintenance documentation and logs",
      "Schedule follow-up review if necessary",
    ],
  },
] as const;

async function seedServerMaintenanceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Operations",
      slug: "operations",
      description: "Checklist templates for operational processes and maintenance.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Operations",
        description: "Checklist templates for operational processes and maintenance.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Server Maintenance",
      slug: "server-maintenance",
      description: "Routine server maintenance and operational checklist.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Server Maintenance",
        description: "Routine server maintenance and operational checklist.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Server Maintenance Checklist",
      slug: "server-maintenance-checklist",
      description: "Checklist for planning, performing, and validating server maintenance tasks.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Server Maintenance Checklist",
        description: "Checklist for planning, performing, and validating server maintenance tasks.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of SERVER_MAINTENANCE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

const CYBERSECURITY_AUDIT_CHECKLIST = [
  {
    title: "Audit Planning and Scope",
    items: [
      "Define audit objectives and scope",
      "Identify systems, applications, and networks to audit",
      "Determine compliance requirements and standards",
      "Assign audit roles and responsibilities",
      "Prepare audit timeline and schedule",
      "Review previous audit reports and findings",
      "Identify critical business assets and data",
      "Define risk assessment criteria",
      "Obtain necessary access permissions",
      "Prepare incident response contacts and procedures",
    ],
  },
  {
    title: "Asset Inventory and Management",
    items: [
      "Verify inventory of hardware devices",
      "Verify inventory of software applications",
      "Identify unauthorized or unknown devices",
      "Review cloud services and external platforms",
      "Confirm asset ownership and responsibility",
      "Check asset lifecycle and update status",
      "Verify backup systems and storage devices",
      "Review mobile and remote devices",
      "Confirm proper disposal procedures for retired assets",
      "Ensure inventory documentation is current",
    ],
  },
  {
    title: "User Accounts and Access Control",
    items: [
      "Review user account permissions",
      "Verify role-based access controls",
      "Identify inactive or unused accounts",
      "Confirm strong password policies",
      "Verify multi-factor authentication implementation",
      "Review privileged/admin account usage",
      "Check account lockout and session timeout settings",
      "Confirm least-privilege access principles",
      "Audit third-party and vendor access",
      "Review onboarding and offboarding access procedures",
    ],
  },
  {
    title: "Network Security",
    items: [
      "Review firewall configurations",
      "Verify intrusion detection/prevention systems",
      "Check VPN and remote access security",
      "Audit wireless network security settings",
      "Verify network segmentation implementation",
      "Review open ports and unnecessary services",
      "Check DNS and DHCP security configurations",
      "Test network monitoring and logging systems",
      "Verify secure network protocols are used",
      "Review external exposure and internet-facing services",
    ],
  },
  {
    title: "Endpoint and Device Security",
    items: [
      "Verify antivirus and endpoint protection software",
      "Check operating system update status",
      "Review patch management procedures",
      "Confirm device encryption implementation",
      "Test USB and removable media restrictions",
      "Audit mobile device management policies",
      "Verify secure configuration baselines",
      "Review local administrator access",
      "Check device lock and inactivity timeout settings",
      "Confirm backup and recovery procedures",
    ],
  },
  {
    title: "Application and Software Security",
    items: [
      "Review software update and patching process",
      "Verify secure coding practices",
      "Audit authentication and authorization mechanisms",
      "Check API security configurations",
      "Test input validation and sanitization",
      "Review dependency and vulnerability management",
      "Verify application logging and monitoring",
      "Check data encryption in transit and at rest",
      "Confirm secure deployment practices",
      "Review third-party software risks",
    ],
  },
  {
    title: "Data Protection and Privacy",
    items: [
      "Identify sensitive and confidential data",
      "Verify data classification policies",
      "Review data encryption practices",
      "Audit backup and recovery procedures",
      "Confirm secure data storage locations",
      "Check data retention and deletion policies",
      "Verify compliance with privacy regulations",
      "Review file sharing and access permissions",
      "Audit cloud storage security",
      "Confirm disaster recovery readiness",
    ],
  },
  {
    title: "Logging, Monitoring, and Incident Response",
    items: [
      "Verify centralized logging systems",
      "Review security event monitoring processes",
      "Test alert and notification systems",
      "Confirm log retention policies",
      "Audit incident response procedures",
      "Verify incident escalation paths",
      "Review past security incidents and responses",
      "Test backup communication methods",
      "Conduct incident response simulation if needed",
      "Ensure forensic data collection capability",
    ],
  },
  {
    title: "Physical Security",
    items: [
      "Inspect server rooms and restricted areas",
      "Verify access control systems",
      "Review visitor access procedures",
      "Check surveillance and monitoring systems",
      "Confirm environmental protections (fire, temperature, water)",
      "Audit hardware storage security",
      "Verify secure disposal of physical documents and devices",
      "Test emergency power and backup systems",
      "Review physical security policies and signage",
      "Confirm equipment locking mechanisms",
    ],
  },
  {
    title: "Compliance and Policy Review",
    items: [
      "Review cybersecurity policies and procedures",
      "Verify employee security awareness training",
      "Check compliance with industry regulations",
      "Audit password and authentication policies",
      "Review acceptable use policies",
      "Confirm vendor and third-party compliance",
      "Verify business continuity plans",
      "Review security exception handling",
      "Check documentation completeness and accuracy",
      "Ensure regular policy review schedule exists",
    ],
  },
  {
    title: "Vulnerability and Penetration Testing",
    items: [
      "Run vulnerability scans",
      "Review scan results and remediation status",
      "Test web application security",
      "Perform penetration testing if authorized",
      "Check for outdated or unsupported software",
      "Verify remediation of known vulnerabilities",
      "Test phishing awareness if applicable",
      "Audit exposed credentials or sensitive data",
      "Confirm security patch deployment timelines",
      "Document identified risks and recommendations",
    ],
  },
  {
    title: "Audit Reporting and Follow-Up",
    items: [
      "Document all findings and observations",
      "Prioritize risks by severity and impact",
      "Prepare remediation recommendations",
      "Assign remediation responsibilities",
      "Schedule follow-up reviews",
      "Present audit results to stakeholders",
      "Archive audit logs and evidence securely",
      "Track remediation progress",
      "Update security roadmap and action plans",
      "Plan next cybersecurity audit cycle",
    ],
  },
] as const;

async function seedCybersecurityAuditTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Security",
      slug: "security",
      description: "Checklist templates for safety, security, and emergency preparedness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Security",
        description: "Checklist templates for safety, security, and emergency preparedness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Cybersecurity Audit",
      slug: "cybersecurity-audit",
      description: "Comprehensive cybersecurity audit checklist for systems, networks, and applications.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Cybersecurity Audit",
        description: "Comprehensive cybersecurity audit checklist for systems, networks, and applications.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Cybersecurity Audit Checklist",
      slug: "cybersecurity-audit-checklist",
      description: "A detailed checklist to guide cybersecurity audits across infrastructure, applications, and policies.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Cybersecurity Audit Checklist",
        description: "A detailed checklist to guide cybersecurity audits across infrastructure, applications, and policies.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CYBERSECURITY_AUDIT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}



const DRONE_PREFLIGHT_CHECKLIST = [
  {
    title: "Personal Readiness",
    items: [
      "Verify drone operator certification/license requirements",
      "Carry required identification and permits",
      "Review local drone regulations and airspace restrictions",
      "Check weather conditions (wind, rain, visibility)",
      "Assess physical and mental condition before flight",
      "Ensure adequate battery level for mobile device/controller",
      "Inform team or observer about flight plan",
      "Review emergency procedures",
      "Confirm mission objectives and flight area",
      "Check NOTAMs or temporary flight restrictions",
    ],
  },
  {
    title: "Drone Inspection",
    items: [
      "Inspect drone body for visible damage",
      "Verify propellers are properly attached and undamaged",
      "Check motors for debris or obstruction",
      "Inspect landing gear condition",
      "Confirm gimbal functionality",
      "Clean camera lens and sensors",
      "Verify firmware is updated",
      "Check internal storage or SD card availability",
      "Ensure GPS module is functioning",
      "Confirm remote controller operation",
    ],
  },
  {
    title: "Battery and Power Checks",
    items: [
      "Fully charge drone batteries",
      "Fully charge controller batteries",
      "Bring spare batteries if needed",
      "Inspect batteries for swelling or damage",
      "Confirm battery locking mechanism is secure",
      "Check battery temperature before flight",
      "Pack charging equipment if necessary",
    ],
  },
  {
    title: "Flight Environment Assessment",
    items: [
      "Inspect takeoff and landing zone",
      "Check for obstacles (trees, power lines, buildings)",
      "Assess nearby people, vehicles, or animals",
      "Verify GPS signal strength",
      "Evaluate electromagnetic interference risks",
      "Confirm safe emergency landing areas",
      "Check sun position and lighting conditions",
      "Assess wind direction and gusts",
    ],
  },
  {
    title: "Flight Setup",
    items: [
      "Power on controller and drone",
      "Verify controller-drone connection",
      "Calibrate compass if required",
      "Confirm home point is correctly set",
      "Check satellite connection count",
      "Verify return-to-home settings",
      "Configure camera settings",
      "Confirm flight mode selection",
      "Set maximum altitude and distance limits",
      "Test basic control responsiveness",
    ],
  },
  {
    title: "Before Takeoff",
    items: [
      "Conduct final visual inspection",
      "Confirm propeller area is clear",
      "Verify recording settings if filming",
      "Start video recording if needed",
      "Announce takeoff to nearby personnel",
      "Confirm battery levels are sufficient",
      "Double-check mission route",
      "Ensure failsafe settings are active",
      "Verify obstacle avoidance systems",
      "Begin takeoff slowly and steadily",
    ],
  },
  {
    title: "During Flight",
    items: [
      "Maintain visual line of sight",
      "Monitor battery levels continuously",
      "Watch for airspace hazards",
      "Monitor GPS signal and telemetry",
      "Avoid restricted or crowded areas",
      "Maintain safe altitude",
      "Monitor weather changes",
      "Avoid aggressive maneuvers when unnecessary",
      "Keep communication with spotter/team",
      "Be prepared for manual return if needed",
    ],
  },
  {
    title: "After Flight",
    items: [
      "Land safely in designated area",
      "Power off drone and controller",
      "Inspect drone for damage",
      "Remove and store batteries safely",
      "Review captured footage/photos",
      "Log flight details",
      "Check remaining battery levels",
      "Clean drone and equipment if necessary",
      "Recharge batteries for next mission",
      "Report incidents or anomalies if applicable",
    ],
  },
] as const;

const INTERNATIONAL_TRAVEL_CHECKLIST = [
  {
    title: "Travel Documents",
    items: [
      "Verify passport validity (minimum 6 months recommended)",
      "Check visa requirements for destination countries",
      "Print or save digital copies of passport and visas",
      "Prepare travel insurance documents",
      "Carry flight tickets and boarding passes",
      "Confirm hotel/accommodation reservations",
      "Prepare emergency contact information",
      "Carry driver's license or international driving permit if needed",
      "Check vaccination or health certificate requirements",
      "Store important documents in secure travel wallet",
    ],
  },
  {
    title: "Financial Preparation",
    items: [
      "Notify bank about international travel",
      "Verify credit/debit cards work abroad",
      "Exchange currency or prepare local cash",
      "Check international transaction fees",
      "Set travel budget",
      "Enable online banking access",
      "Prepare backup payment method",
      "Save emergency financial contacts",
    ],
  },
  {
    title: "Health and Safety",
    items: [
      "Pack personal medications",
      "Carry prescriptions if required",
      "Prepare first aid kit",
      "Check destination health advisories",
      "Verify vaccination requirements",
      "Pack hygiene and sanitary products",
      "Save emergency medical contacts",
      "Research local emergency numbers",
      "Check weather forecast for destination",
      "Prepare sunscreen/insect repellent if necessary",
    ],
  },
  {
    title: "Packing Preparation",
    items: [
      "Create packing list based on destination climate",
      "Pack weather-appropriate clothing",
      "Pack comfortable walking shoes",
      "Prepare travel-size toiletries",
      "Pack chargers and adapters",
      "Bring universal power adapter",
      "Carry portable power bank",
      "Pack headphones/entertainment items",
      "Prepare reusable water bottle",
      "Label luggage with contact information",
    ],
  },
  {
    title: "Technology and Communication",
    items: [
      "Verify international roaming plan",
      "Download offline maps",
      "Save digital copies of reservations",
      "Install translation apps if needed",
      "Charge all devices before departure",
      "Backup important phone data",
      "Prepare SIM card/eSIM if necessary",
      "Download airline and travel apps",
      "Check internet availability at destination",
    ],
  },
  {
    title: "Home Preparation Before Departure",
    items: [
      "Lock all windows and doors",
      "Unplug unnecessary electronics",
      "Arrange mail/package collection",
      "Inform trusted person about travel plans",
      "Set automatic lights or timers if needed",
      "Empty refrigerator of perishable food",
      "Take out trash",
      "Secure valuables at home",
      "Confirm pet care arrangements",
      "Adjust thermostat if needed",
    ],
  },
  {
    title: "Airport and Departure Preparation",
    items: [
      "Confirm flight time and terminal",
      "Check airline baggage requirements",
      "Arrive early at airport",
      "Verify carry-on restrictions",
      "Charge devices before departure",
      "Keep essential items in carry-on luggage",
      "Prepare snacks and water bottle",
      "Wear comfortable travel clothing",
      "Check transportation to airport",
      "Verify passport and tickets before leaving home",
    ],
  },
  {
    title: "During Travel",
    items: [
      "Monitor flight updates",
      "Keep valuables secure",
      "Stay hydrated during travel",
      "Follow customs and immigration instructions",
      "Keep important documents accessible",
      "Confirm transportation from airport to accommodation",
      "Inform family/friends after arrival",
      "Check local transportation options",
      "Follow local laws and regulations",
      "Stay aware of surroundings and safety guidelines",
    ],
  },
] as const;

const CAMPING_HIKING_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose camping and hiking destination",
      "Check weather forecast",
      "Review trail maps and route information",
      "Verify campsite reservations or permits",
      "Inform someone about travel plans and schedule",
      "Research local wildlife and safety guidelines",
      "Check fire regulations and restrictions",
      "Plan transportation and parking",
      "Estimate hiking duration and difficulty",
      "Prepare emergency contact information",
    ],
  },
  {
    title: "Shelter and Sleeping Gear",
    items: [
      "Pack tent and rainfly",
      "Bring tent stakes and repair kit",
      "Pack sleeping bag suitable for temperature",
      "Bring sleeping pad or air mattress",
      "Pack camping pillow",
      "Bring ground tarp or footprint",
      "Pack extra blankets if needed",
      "Test tent setup before departure",
    ],
  },
  {
    title: "Clothing and Personal Items",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket",
      "Pack hiking boots or trail shoes",
      "Bring extra socks",
      "Pack hat and sunglasses",
      "Bring gloves if needed",
      "Pack sleepwear",
      "Bring toiletries and hygiene products",
      "Pack towel and wet wipes",
      "Bring sunscreen and insect repellent",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Pack sufficient drinking water",
      "Bring water filtration or purification system",
      "Prepare meals and snacks",
      "Pack portable stove or cooking equipment",
      "Bring fuel for stove",
      "Pack cooking utensils and cookware",
      "Bring reusable plates/cups",
      "Pack cooler if necessary",
      "Store food in wildlife-safe containers",
      "Bring trash bags for waste disposal",
    ],
  },
  {
    title: "Hiking Equipment",
    items: [
      "Pack backpack with proper fit",
      "Bring hiking poles if needed",
      "Carry map and compass",
      "Bring GPS device or offline maps",
      "Pack flashlight or headlamp",
      "Bring extra batteries or power bank",
      "Carry whistle for emergencies",
      "Pack multitool or knife",
      "Bring lightweight rain cover for backpack",
      "Carry emergency shelter or blanket",
    ],
  },
  {
    title: "Safety and Emergency Supplies",
    items: [
      "Pack first aid kit",
      "Bring emergency medication",
      "Carry fire starter or waterproof matches",
      "Pack emergency whistle",
      "Bring signaling mirror if needed",
      "Carry rope or paracord",
      "Prepare emergency contact list",
      "Pack backup light source",
      "Bring bear spray if required in area",
      "Check phone battery before departure",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all packed gear",
      "Charge electronic devices",
      "Fill vehicle fuel tank",
      "Download offline maps",
      "Secure campsite reservation details",
      "Confirm weather and trail conditions",
      "Lock home and secure valuables",
      "Check vehicle emergency kit",
      "Verify all permits are packed",
      "Leave itinerary with trusted contact",
    ],
  },
  {
    title: "At the Campsite",
    items: [
      "Inspect campsite safety",
      "Set up tent on stable ground",
      "Store food securely",
      "Identify nearest water source",
      "Establish safe campfire area",
      "Keep campsite clean and organized",
      "Follow Leave No Trace principles",
      "Monitor weather conditions",
      "Secure gear overnight",
      "Extinguish fire completely before sleeping",
    ],
  },
  {
    title: "During the Hike",
    items: [
      "Stay on marked trails",
      "Monitor hydration levels",
      "Take regular breaks",
      "Watch for wildlife and hazards",
      "Check navigation frequently",
      "Monitor weather changes",
      "Keep group together",
      "Avoid overexertion",
      "Follow trail safety guidelines",
      "Turn back if conditions become unsafe",
    ],
  },
  {
    title: "Before Leaving",
    items: [
      "Pack all gear and belongings",
      "Clean campsite thoroughly",
      "Extinguish campfire completely",
      "Dispose of trash properly",
      "Check campsite for forgotten items",
      "Inspect area for environmental impact",
      "Secure equipment for transport",
      "Review trip notes or observations",
      "Notify contacts after safe return",
      "Clean and dry gear after arriving home",
    ],
  },
] as const;

const HIKING_SAFETY_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose hiking trail and destination",
      "Research trail difficulty and distance",
      "Check weather forecast",
      "Review trail maps and route information",
      "Estimate hiking duration and return time",
      "Inform someone about hiking plans and schedule",
      "Identify emergency exit routes",
      "Check park rules and regulations",
      "Verify trail permits if required",
      "Plan backup route or turnaround point",
    ],
  },
  {
    title: "Clothing and Footwear",
    items: [
      "Wear proper hiking boots or trail shoes",
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket or rain gear",
      "Wear moisture-wicking layers",
      "Pack extra socks",
      "Bring hat and sunglasses",
      "Wear gloves if needed for cold conditions",
      "Carry extra clothing layers for temperature changes",
      "Use sunscreen and lip protection",
    ],
  },
  {
    title: "Navigation and Communication",
    items: [
      "Carry map and compass",
      "Bring GPS device or navigation app",
      "Download offline maps",
      "Fully charge phone and electronic devices",
      "Bring power bank or spare batteries",
      "Save emergency contact numbers",
      "Carry whistle for signaling",
      "Test communication devices before departure",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Carry enough drinking water",
      "Bring water filtration or purification system",
      "Pack high-energy snacks",
      "Prepare meals if hiking long distance",
      "Bring electrolyte supplements if needed",
      "Store food securely",
      "Pack reusable water bottles",
      "Carry emergency food supply",
    ],
  },
  {
    title: "Safety and Emergency Equipment",
    items: [
      "Pack first aid kit",
      "Bring emergency blanket or shelter",
      "Carry flashlight or headlamp",
      "Bring spare batteries",
      "Pack multi-tool or knife",
      "Carry fire starter or waterproof matches",
      "Bring trekking poles if needed",
      "Pack emergency whistle",
      "Carry personal medications",
      "Bring insect repellent",
    ],
  },
  {
    title: "Environmental and Trail Safety",
    items: [
      "Stay on marked trails",
      "Check for wildlife activity in the area",
      "Avoid dangerous or unstable terrain",
      "Monitor weather changes continuously",
      "Be cautious near cliffs or water crossings",
      "Respect trail closures and warnings",
      "Follow Leave No Trace principles",
      "Avoid hiking alone if possible",
      "Keep safe distance from wildlife",
      "Turn back if conditions become unsafe",
    ],
  },
  {
    title: "Physical Readiness",
    items: [
      "Assess fitness level before the hike",
      "Stretch and warm up before starting",
      "Pace yourself appropriately",
      "Take regular breaks",
      "Stay hydrated during hike",
      "Monitor for signs of exhaustion or dehydration",
      "Avoid overloading backpack",
      "Get adequate rest before hiking day",
    ],
  },
  {
    title: "Backpack and Gear Check",
    items: [
      "Pack lightweight and essential gear only",
      "Secure backpack straps properly",
      "Carry rain cover for backpack",
      "Pack trash bags for waste",
      "Bring identification documents if needed",
      "Carry cash/cards for emergencies",
      "Pack camera or binoculars if desired",
      "Ensure all gear is weather-protected",
    ],
  },
  {
    title: "Before Starting the Hike",
    items: [
      "Recheck weather and trail conditions",
      "Confirm everyone in group is prepared",
      "Verify navigation tools are working",
      "Apply sunscreen and insect repellent",
      "Review emergency procedures",
      "Set expected check-in time with contact person",
      "Lock vehicle and secure valuables",
      "Start hike early enough for daylight return",
      "Check water and food supplies one final time",
    ],
  },
  {
    title: "During the Hike",
    items: [
      "Monitor trail markers regularly",
      "Keep group together",
      "Watch footing and terrain carefully",
      "Stay aware of changing weather",
      "Drink water regularly",
      "Avoid unnecessary risks or shortcuts",
      "Check energy levels periodically",
      "Take shelter if severe weather develops",
      "Monitor for signs of injury or fatigue",
      "Turn back if conditions worsen",
    ],
  },
  {
    title: "After the Hike",
    items: [
      "Notify contact person of safe return",
      "Stretch and hydrate after hike",
      "Inspect gear for damage",
      "Clean and store equipment properly",
      "Treat minor injuries or blisters",
      "Refill and recharge used supplies",
      "Review trail experience and notes",
      "Dispose of trash responsibly",
      "Back up photos or GPS tracks if desired",
      "Plan improvements for future hikes",
    ],
  },
] as const;

const TENT_CAMPING_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose camping destination",
      "Decide trip dates and duration",
      "Check campsite availability and reservations",
      "Review campsite rules and regulations",
      "Check weather forecast",
      "Research terrain and local conditions",
      "Plan transportation and route",
      "Share itinerary with friends/family",
      "Prepare emergency contact information",
      "Verify required permits or passes",
    ],
  },
  {
    title: "Tent and Shelter Equipment",
    items: [
      "Pack tent",
      "Pack rainfly and ground tarp",
      "Bring tent stakes and guylines",
      "Carry tent repair kit",
      "Test tent setup before departure",
      "Pack sleeping bags",
      "Bring sleeping pads or air mattresses",
      "Pack camping pillows",
      "Bring extra blankets if needed",
      "Prepare waterproof storage bags",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket",
      "Pack extra socks and underwear",
      "Bring hiking/camping shoes",
      "Pack warm layers for night temperatures",
      "Bring hat and sunglasses",
      "Pack gloves if needed",
      "Carry personal hygiene products",
      "Bring towel and wet wipes",
      "Pack sunscreen and insect repellent",
    ],
  },
  {
    title: "Food and Cooking Supplies",
    items: [
      "Plan meals for the trip",
      "Pack snacks and drinks",
      "Bring drinking water",
      "Carry water filtration or purification system",
      "Pack camping stove or grill",
      "Bring cooking fuel",
      "Carry cookware and utensils",
      "Bring reusable plates/cups",
      "Pack cooler if necessary",
      "Bring trash bags for waste disposal",
    ],
  },
  {
    title: "Safety and Emergency Equipment",
    items: [
      "Pack first aid kit",
      "Bring flashlight or headlamp",
      "Carry extra batteries or power bank",
      "Pack fire starter or matches",
      "Bring multitool or knife",
      "Carry emergency whistle",
      "Bring map and compass",
      "Pack phone charger/power bank",
      "Prepare emergency shelter or blanket",
      "Carry any personal medications",
    ],
  },
  {
    title: "Camp Setup Preparation",
    items: [
      "Select safe tent location",
      "Check ground stability and drainage",
      "Clear rocks and debris from tent area",
      "Set up tent securely",
      "Store food safely away from wildlife",
      "Designate cooking and eating area",
      "Prepare campfire area if allowed",
      "Organize camping gear accessibly",
      "Keep emergency supplies reachable",
      "Check nearby restroom/water access",
    ],
  },
  {
    title: "Activities and Recreation",
    items: [
      "Pack hiking equipment if needed",
      "Bring fishing gear if allowed",
      "Carry outdoor games or activities",
      "Pack camera or binoculars",
      "Bring books or entertainment items",
      "Prepare swimming gear if applicable",
      "Pack folding chairs or picnic blanket",
      "Bring portable speaker if appropriate",
      "Plan group activities",
      "Prepare backup activities for bad weather",
    ],
  },
  {
    title: "Before Leaving Home",
    items: [
      "Charge all electronic devices",
      "Download offline maps",
      "Fuel vehicle",
      "Secure home before departure",
      "Inform emergency contact of destination",
      "Double-check all packed items",
      "Verify reservation confirmations",
      "Check traffic and travel conditions",
      "Prepare cash/cards for emergencies",
      "Pack IDs and important documents",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor weather conditions",
      "Stay hydrated",
      "Keep campsite clean",
      "Follow fire safety rules",
      "Respect wildlife and nature",
      "Follow Leave No Trace principles",
      "Secure valuables and food overnight",
      "Keep communication devices charged",
      "Supervise children and pets",
      "Stay aware of surroundings",
    ],
  },
  {
    title: "Before Returning Home",
    items: [
      "Extinguish campfire completely",
      "Clean campsite thoroughly",
      "Pack all equipment and trash",
      "Check campsite for forgotten items",
      "Secure gear for transport",
      "Dispose of waste properly",
      "Inspect tent and gear for damage",
      "Notify contacts after safe return",
      "Clean and dry equipment at home",
      "Store camping gear properly",
    ],
  },
] as const;

const ROAD_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose destination and route",
      "Plan daily driving distances",
      "Research road conditions and traffic",
      "Check weather forecast along the route",
      "Book accommodations if needed",
      "Identify fuel stations and rest stops",
      "Prepare backup route options",
      "Share itinerary with family or friends",
      "Save emergency contact numbers",
      "Download offline maps/navigation",
    ],
  },
  {
    title: "Vehicle Inspection",
    items: [
      "Check engine oil level",
      "Inspect coolant level",
      "Check brake fluid",
      "Verify windshield washer fluid",
      "Inspect tire pressure",
      "Check spare tire condition",
      "Test brakes",
      "Inspect headlights and taillights",
      "Verify battery condition",
      "Ensure windshield wipers work properly",
    ],
  },
  {
    title: "Emergency and Safety Supplies",
    items: [
      "Pack first aid kit",
      "Bring emergency roadside kit",
      "Carry jumper cables",
      "Pack flashlight with extra batteries",
      "Bring reflective warning triangle",
      "Carry portable phone charger/power bank",
      "Pack basic tools and multitool",
      "Bring tire inflator or repair kit",
      "Carry emergency blanket",
      "Prepare extra drinking water",
    ],
  },
  {
    title: "Documents and Finances",
    items: [
      "Carry driver's license",
      "Bring vehicle registration documents",
      "Carry proof of insurance",
      "Pack roadside assistance information",
      "Prepare toll payment methods",
      "Bring cash and bank cards",
      "Verify fuel payment options",
      "Store copies of important documents",
    ],
  },
  {
    title: "Packing and Luggage",
    items: [
      "Pack weather-appropriate clothing",
      "Bring comfortable shoes",
      "Pack toiletries and hygiene items",
      "Prepare snacks and drinks",
      "Bring reusable water bottles",
      "Pack chargers and electronics",
      "Organize luggage efficiently",
      "Secure loose items inside vehicle",
      "Bring travel pillows and blankets",
      "Pack entertainment items for passengers",
    ],
  },
  {
    title: "Navigation and Technology",
    items: [
      "Update GPS/navigation apps",
      "Download offline maps",
      "Prepare phone mounts and chargers",
      "Test car audio and Bluetooth",
      "Save hotel and destination addresses",
      "Check mobile network coverage",
      "Bring camera or travel accessories",
      "Charge all electronic devices before departure",
    ],
  },
  {
    title: "Comfort and Convenience",
    items: [
      "Clean vehicle interior",
      "Adjust seats and mirrors",
      "Prepare sunglasses",
      "Pack sunscreen if needed",
      "Bring reusable shopping bags",
      "Prepare wet wipes and tissues",
      "Bring hand sanitizer",
      "Organize easy access to snacks and essentials",
      "Prepare playlists or podcasts",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Fill fuel tank",
      "Recheck weather conditions",
      "Confirm accommodations and reservations",
      "Inform someone of departure time",
      "Lock home and secure valuables",
      "Unplug unnecessary electronics at home",
      "Check traffic conditions",
      "Verify all luggage is packed",
      "Double-check travel documents",
      "Ensure everyone is ready before departure",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Take regular driving breaks",
      "Stay hydrated",
      "Monitor fuel levels",
      "Follow speed limits and traffic laws",
      "Watch for weather changes",
      "Keep phone charged",
      "Rotate drivers if possible",
      "Secure valuables when stopping",
      "Monitor vehicle performance",
      "Stay alert and avoid distracted driving",
    ],
  },
  {
    title: "After Arrival",
    items: [
      "Inspect vehicle for issues",
      "Secure luggage and valuables",
      "Confirm accommodation check-in",
      "Recharge devices if needed",
      "Review next-day travel plans",
      "Refuel vehicle if necessary",
      "Back up travel photos/videos",
      "Notify family/friends of safe arrival",
      "Organize items for easy access",
      "Rest before continuing the trip",
    ],
  },
] as const;

const PHOTO_SHOOT_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Define the purpose and style of the photo shoot",
      "Confirm date, time, and location",
      "Check weather forecast for outdoor shoots",
      "Create a shot list or mood board",
      "Confirm schedule with clients/models/team",
      "Obtain location permits if required",
      "Scout the location in advance",
      "Plan backup indoor location if necessary",
      "Prepare posing ideas and references",
      "Review lighting conditions at the location",
    ],
  },
  {
    title: "Camera Equipment",
    items: [
      "Pack camera body/bodies",
      "Charge camera batteries",
      "Bring spare batteries",
      "Pack memory cards",
      "Format memory cards if needed",
      "Clean camera sensor and lenses",
      "Pack required lenses",
      "Bring lens filters if necessary",
      "Carry camera straps and mounts",
      "Test camera settings before departure",
    ],
  },
  {
    title: "Lighting Equipment",
    items: [
      "Pack flashes or strobes",
      "Bring light stands",
      "Pack softboxes or modifiers",
      "Carry reflectors",
      "Bring diffusers",
      "Pack triggers and sync cables",
      "Test lighting equipment",
      "Bring extension cords and power strips",
      "Pack spare bulbs/batteries if needed",
      "Prepare portable lighting for outdoor use",
    ],
  },
  {
    title: "Audio and Video Accessories (if applicable)",
    items: [
      "Pack microphones",
      "Bring audio recorder",
      "Carry headphones for monitoring",
      "Pack tripod or stabilizer",
      "Bring extra cables and adapters",
      "Test audio/video equipment",
    ],
  },
  {
    title: "Props and Styling",
    items: [
      "Prepare props for the shoot",
      "Confirm wardrobe and outfits",
      "Bring backup clothing options",
      "Pack accessories and jewelry",
      "Prepare makeup and hair supplies",
      "Bring lint roller and clothing clips",
      "Pack mirrors if needed",
      "Organize styling area",
    ],
  },
  {
    title: "Client and Team Coordination",
    items: [
      "Confirm arrival times with team members",
      "Share location details and parking instructions",
      "Prepare model release forms if needed",
      "Confirm contact numbers for all participants",
      "Review shoot schedule with the team",
      "Clarify responsibilities during the shoot",
      "Prepare snacks and water for the team",
      "Plan breaks during long sessions",
    ],
  },
  {
    title: "Technology and File Management",
    items: [
      "Charge laptop/tablet if bringing one",
      "Prepare backup storage devices",
      "Bring card readers and cables",
      "Verify editing software availability",
      "Prepare tethering setup if required",
      "Back up previous work before leaving",
      "Check internet/mobile hotspot availability if needed",
    ],
  },
  {
    title: "Before Leaving for the Shoot",
    items: [
      "Double-check all packed equipment",
      "Confirm batteries are fully charged",
      "Verify memory cards are empty and working",
      "Review shot list one final time",
      "Check traffic and travel time",
      "Confirm weather conditions again",
      "Bring cash/cards for emergencies",
      "Pack personal essentials and ID",
      "Secure equipment in transport cases",
      "Leave early to avoid delays",
    ],
  },
  {
    title: "During the Photo Shoot",
    items: [
      "Test exposure and lighting setup",
      "Review photos periodically for quality",
      "Communicate clearly with subjects/models",
      "Adjust settings as conditions change",
      "Keep equipment organized and protected",
      "Monitor battery and storage levels",
      "Follow the planned shot list",
      "Capture backup shots and variations",
      "Maintain safe working environment",
      "Back up files if possible during breaks",
    ],
  },
  {
    title: "After the Shoot",
    items: [
      "Back up all photos immediately",
      "Organize and label files",
      "Inspect equipment for damage",
      "Recharge batteries",
      "Clean and store equipment properly",
      "Review and select best images",
      "Send previews if agreed with client",
      "Archive project files securely",
      "Record notes for future improvements",
      "Confirm delivery timeline with client",
    ],
  },
] as const;

const VIDEO_PRODUCTION_CHECKLIST = [
  {
    title: "Pre-Production Planning",
    items: [
      "Define shooting goals and deliverables",
      "Finalize script or shooting outline",
      "Review storyboard or shot list",
      "Confirm filming schedule and call times",
      "Verify filming locations and permits",
      "Check weather forecast for outdoor shoots",
      "Confirm transportation and parking arrangements",
      "Prepare production timeline",
      "Share contact list with crew and talent",
      "Review safety requirements for the set",
    ],
  },
  {
    title: "Camera Equipment",
    items: [
      "Pack primary camera body",
      "Pack backup camera if available",
      "Charge camera batteries",
      "Bring spare batteries",
      "Pack memory cards/media storage",
      "Format memory cards if needed",
      "Clean lenses and camera sensors",
      "Pack required lenses",
      "Bring tripods, monopods, or stabilizers",
      "Test all camera settings before departure",
    ],
  },
  {
    title: "Audio Equipment",
    items: [
      "Pack microphones (lavaliers, shotgun, handheld)",
      "Bring audio recorder",
      "Pack headphones for monitoring",
      "Carry audio cables and adapters",
      "Test audio recording levels",
      "Bring spare batteries for audio gear",
      "Pack wind protection for microphones",
      "Prepare backup audio solution",
    ],
  },
  {
    title: "Lighting Equipment",
    items: [
      "Pack lights and light stands",
      "Bring softboxes or modifiers",
      "Pack reflectors and diffusers",
      "Carry extension cords and power strips",
      "Bring gaffer tape and clamps",
      "Test lighting equipment",
      "Pack spare bulbs or batteries",
      "Prepare portable lighting if filming outdoors",
    ],
  },
  {
    title: "Props, Wardrobe, and Set Preparation",
    items: [
      "Confirm wardrobe for all talent",
      "Pack backup clothing options",
      "Prepare props and set decorations",
      "Bring makeup and grooming supplies",
      "Pack mirrors and styling accessories",
      "Organize continuity notes and references",
      "Prepare branding materials if needed",
      "Check set cleanliness and readiness",
    ],
  },
  {
    title: "Crew and Talent Coordination",
    items: [
      "Confirm attendance of crew and talent",
      "Share filming schedule and shot list",
      "Assign crew responsibilities",
      "Prepare release forms if required",
      "Confirm catering/snacks/water arrangements",
      "Review communication methods during filming",
      "Plan breaks for long shooting sessions",
      "Confirm emergency contacts",
    ],
  },
  {
    title: "Technology and File Management",
    items: [
      "Bring laptop/tablet if needed",
      "Pack external hard drives or SSDs",
      "Bring card readers and cables",
      "Prepare backup storage solution",
      "Verify editing/project files availability",
      "Test tethering or live monitoring setup",
      "Charge all electronic devices",
      "Check internet/mobile hotspot access if needed",
    ],
  },
  {
    title: "Before Leaving for the Shoot",
    items: [
      "Double-check all packed equipment",
      "Verify batteries are fully charged",
      "Confirm memory/storage availability",
      "Review shot list one final time",
      "Check traffic and travel conditions",
      "Confirm location access instructions",
      "Bring IDs, permits, and documents",
      "Secure equipment in transport cases",
      "Leave early to avoid delays",
      "Notify crew of departure if necessary",
    ],
  },
  {
    title: "During Filming",
    items: [
      "Test video and audio before recording",
      "Monitor exposure, focus, and framing",
      "Check audio quality continuously",
      "Follow the shot list and production schedule",
      "Capture backup takes when needed",
      "Monitor battery and storage levels",
      "Keep equipment organized and protected",
      "Maintain clear communication with crew",
      "Ensure set safety at all times",
      "Back up footage during breaks if possible",
    ],
  },
  {
    title: "After Filming",
    items: [
      "Back up all footage immediately",
      "Organize and label media files",
      "Inspect equipment for damage",
      "Recharge batteries",
      "Clean and store equipment properly",
      "Review footage for missing shots",
      "Confirm wrap-up with crew and talent",
      "Archive project assets securely",
      "Record production notes for editing",
      "Plan next production or editing steps",
    ],
  },
] as const;

const WEDDING_EVENT_CHECKLIST = [
  {
    title: "Event Planning",
    items: [
      "Confirm wedding date and schedule",
      "Finalize guest list",
      "Send invitations and track RSVPs",
      "Confirm wedding venue booking",
      "Review ceremony and reception timeline",
      "Prepare seating arrangements",
      "Confirm wedding theme and decorations",
      "Plan transportation for couple and guests",
      "Prepare backup plan for bad weather",
      "Assign responsibilities to wedding coordinator/team",
    ],
  },
  {
    title: "Legal and Documentation",
    items: [
      "Verify marriage license requirements",
      "Prepare identification documents",
      "Confirm legal ceremony paperwork",
      "Schedule appointments if required",
      "Prepare copies of important documents",
      "Confirm officiant availability",
      "Review contracts with vendors",
      "Organize payment schedules and receipts",
    ],
  },
  {
    title: "Venue Preparation",
    items: [
      "Confirm venue setup details",
      "Verify ceremony and reception layouts",
      "Inspect lighting and sound systems",
      "Arrange tables, chairs, and decorations",
      "Confirm restroom availability and cleanliness",
      "Prepare signage and guest directions",
      "Coordinate parking arrangements",
      "Confirm power access for vendors and equipment",
      "Review emergency exits and safety procedures",
      "Verify venue access times",
    ],
  },
  {
    title: "Catering and Food",
    items: [
      "Finalize menu selections",
      "Confirm guest dietary requirements",
      "Schedule catering delivery/setup times",
      "Arrange wedding cake delivery",
      "Confirm beverages and bar setup",
      "Prepare serving schedule",
      "Verify tableware and utensils",
      "Arrange snacks/water for bridal party",
      "Confirm cleanup responsibilities",
    ],
  },
  {
    title: "Photography and Video",
    items: [
      "Confirm photographer schedule",
      "Confirm videographer schedule",
      "Review shot list and important moments",
      "Prepare backup memory cards and batteries",
      "Share venue access details with media team",
      "Confirm drone permissions if needed",
      "Prepare family/group photo list",
      "Designate contact person for photographer coordination",
    ],
  },
  {
    title: "Wedding Attire and Styling",
    items: [
      "Confirm wedding dress/suit fittings",
      "Prepare accessories and jewelry",
      "Pack comfortable backup shoes",
      "Schedule hair and makeup appointments",
      "Prepare emergency sewing/styling kit",
      "Steam or iron outfits if needed",
      "Organize outfits for bridal party",
      "Prepare rings and ring box",
      "Confirm bouquet and floral arrangements",
    ],
  },
  {
    title: "Music and Entertainment",
    items: [
      "Confirm DJ/band schedule",
      "Prepare ceremony and reception playlists",
      "Test microphones and speakers",
      "Confirm special songs and announcements",
      "Arrange dance floor setup",
      "Prepare backup audio equipment if needed",
      "Coordinate entertainment schedule",
      "Confirm timing for speeches and toasts",
    ],
  },
  {
    title: "Guest Experience",
    items: [
      "Prepare welcome table and guest book",
      "Arrange guest favors or gifts",
      "Confirm accommodation details for guests",
      "Organize transportation/shuttle services",
      "Prepare signage and seating charts",
      "Confirm accessibility needs for guests",
      "Arrange childcare if applicable",
      "Prepare emergency contact list",
    ],
  },
  {
    title: "Emergency and Backup Preparation",
    items: [
      "Prepare first aid kit",
      "Pack stain remover and tissues",
      "Bring extra phone chargers/power banks",
      "Prepare umbrellas or weather protection",
      "Carry backup copies of schedule and contacts",
      "Pack water and snacks for bridal party",
      "Confirm backup transportation options",
      "Assign person to handle emergencies",
    ],
  },
  {
    title: "Before the Event Starts",
    items: [
      "Double-check timeline with vendors",
      "Confirm arrival of all suppliers",
      "Inspect venue setup one final time",
      "Test audio/lighting equipment",
      "Prepare personal belongings and valuables",
      "Ensure wedding rings are ready",
      "Confirm guest seating arrangements",
      "Coordinate bridal party readiness",
      "Review ceremony order with officiant",
      "Take a moment to relax before the ceremony",
    ],
  },
  {
    title: "After the Event",
    items: [
      "Confirm gift collection and transport",
      "Settle remaining vendor payments",
      "Organize cleanup and item pickup",
      "Collect personal belongings and decorations",
      "Back up photos/videos if available",
      "Thank vendors and support team",
      "Review lost-and-found items",
      "Arrange transportation after the event",
      "Store wedding attire properly",
      "Send thank-you messages/cards to guests and vendors",
    ],
  },
] as const;

const CHILDRENS_PARTY_CHECKLIST = [
  {
    title: "Party Planning",
    items: [
      "Choose party date and time",
      "Set party budget",
      "Decide party theme",
      "Create guest list",
      "Send invitations",
      "Track RSVPs",
      "Choose party location",
      "Plan party duration and schedule",
      "Prepare backup plan for bad weather if outdoors",
      "Assign responsibilities to helpers or family members",
    ],
  },
  {
    title: "Venue Preparation",
    items: [
      "Clean and organize party area",
      "Arrange seating and tables",
      "Decorate according to theme",
      "Prepare welcome/sign-in area if needed",
      "Ensure enough space for activities and games",
      "Check restroom cleanliness and supplies",
      "Verify lighting and ventilation",
      "Prepare trash and recycling bins",
      "Secure fragile or dangerous items away from children",
      "Set up music or entertainment systems",
    ],
  },
  {
    title: "Food and Drinks",
    items: [
      "Plan party menu",
      "Order or prepare birthday cake",
      "Arrange snacks and finger foods",
      "Prepare drinks and water stations",
      "Check for food allergies or dietary restrictions",
      "Prepare plates, cups, napkins, and utensils",
      "Organize serving table",
      "Keep food safely stored and refrigerated if needed",
      "Prepare candles and cake-cutting supplies",
      "Plan cleanup supplies for spills and messes",
    ],
  },
  {
    title: "Decorations and Supplies",
    items: [
      "Prepare balloons and banners",
      "Set up themed decorations",
      "Organize party favors or gift bags",
      "Prepare tablecloths and centerpieces",
      "Bring tape, scissors, and extra supplies",
      "Arrange photo area or backdrop",
      "Prepare birthday signs or welcome boards",
      "Inflate balloons in advance if possible",
      "Keep spare decorations available",
    ],
  },
  {
    title: "Entertainment and Activities",
    items: [
      "Plan games and activities",
      "Prepare prizes for games",
      "Organize music playlist",
      "Confirm entertainer bookings if applicable",
      "Prepare craft or activity stations",
      "Arrange outdoor activities if applicable",
      "Test audio/video equipment",
      "Prepare backup indoor activities",
      "Organize schedule for games and breaks",
      "Ensure activities are age-appropriate",
    ],
  },
  {
    title: "Safety and Child Supervision",
    items: [
      "Prepare first aid kit",
      "Ensure emergency contact information is available",
      "Identify safe play areas",
      "Remove hazardous objects or materials",
      "Check childproofing of party area",
      "Arrange adult supervision for activities",
      "Verify pool or outdoor area safety if applicable",
      "Keep cleaning supplies out of children's reach",
      "Ensure exits and pathways are clear",
      "Prepare allergy or medical information if needed",
    ],
  },
  {
    title: "Gift and Celebration Preparation",
    items: [
      "Prepare gift table area",
      "Organize birthday candles and lighter",
      "Prepare thank-you cards if desired",
      "Arrange special moment for cake and singing",
      "Prepare camera or phone for photos/videos",
      "Organize birthday child's outfit",
      "Plan timing for opening gifts if applicable",
      "Prepare extra batteries or chargers for devices",
    ],
  },
  {
    title: "Before Guests Arrive",
    items: [
      "Conduct final venue walkthrough",
      "Set up food and decorations",
      "Confirm entertainment schedule",
      "Prepare music and lighting",
      "Check restroom supplies again",
      "Ensure party supplies are accessible",
      "Put pets in safe area if necessary",
      "Dress birthday child and family",
      "Prepare welcome area for guests",
      "Relax and get ready before guests arrive",
    ],
  },
  {
    title: "During the Party",
    items: [
      "Welcome guests and assist arrivals",
      "Supervise games and activities",
      "Monitor food and drink supplies",
      "Handle spills or accidents quickly",
      "Take photos and videos",
      "Keep party schedule on track",
      "Ensure children remain safe",
      "Assist with gift organization",
      "Encourage participation and fun",
      "Monitor cleanup needs during the event",
    ],
  },
  {
    title: "After the Party",
    items: [
      "Thank guests for attending",
      "Collect and organize gifts",
      "Clean party area",
      "Dispose of trash and recycling",
      "Store leftover food properly",
      "Pack reusable decorations and supplies",
      "Check for forgotten belongings",
      "Review photos and videos",
      "Send thank-you messages if desired",
      "Rest and recover after the event",
    ],
  },
] as const;

const MUSICAL_PERFORMANCE_CHECKLIST = [
  {
    title: "Performance Planning",
    items: [
      "Confirm performance date and time",
      "Verify venue location and access details",
      "Review performance schedule and set times",
      "Confirm lineup and performer responsibilities",
      "Review event contracts and agreements",
      "Check audience capacity and event requirements",
      "Coordinate transportation and arrival times",
      "Prepare emergency contact information",
      "Review venue rules and technical requirements",
      "Plan backup solutions for equipment or schedule issues",
    ],
  },
  {
    title: "Instruments and Music Equipment",
    items: [
      "Pack instruments and accessories",
      "Check instrument condition and tuning",
      "Bring spare strings, sticks, reeds, or picks",
      "Pack amplifiers and cables",
      "Test microphones and audio equipment",
      "Bring pedals, adapters, and power supplies",
      "Pack instrument stands",
      "Prepare backup equipment if possible",
      "Label all equipment and cases",
      "Charge wireless devices and batteries",
    ],
  },
  {
    title: "Audio and Technical Setup",
    items: [
      "Confirm soundcheck schedule",
      "Test PA system and speakers",
      "Verify monitor setup",
      "Check microphones and stands",
      "Test mixing console and audio levels",
      "Prepare playback tracks if needed",
      "Verify stage lighting setup",
      "Test in-ear monitor systems if applicable",
      "Pack extension cords and power strips",
      "Prepare backup audio files and USB drives",
    ],
  },
  {
    title: "Performance Materials",
    items: [
      "Prepare setlist",
      "Print lyrics or sheet music if needed",
      "Organize music folders or tablets",
      "Prepare cue sheets for technicians",
      "Confirm transitions between songs or acts",
      "Prepare introductions or announcements",
      "Review choreography or stage movements if applicable",
      "Bring pens, markers, and tape for stage notes",
    ],
  },
  {
    title: "Clothing and Personal Preparation",
    items: [
      "Prepare performance outfit(s)",
      "Pack backup clothing options",
      "Bring comfortable shoes",
      "Prepare makeup and grooming supplies",
      "Bring towels and hygiene products",
      "Pack water bottles and snacks",
      "Carry personal medications if needed",
      "Bring ear protection if necessary",
      "Get adequate rest before performance",
      "Stay hydrated throughout the day",
    ],
  },
  {
    title: "Team and Communication",
    items: [
      "Confirm arrival times with all performers",
      "Share venue directions and parking details",
      "Assign responsibilities for setup and teardown",
      "Review communication methods during the event",
      "Confirm backstage access passes if needed",
      "Coordinate with event organizers and technicians",
      "Prepare contact list for crew and performers",
      "Review emergency procedures with team",
    ],
  },
  {
    title: "Venue and Stage Preparation",
    items: [
      "Inspect stage area and safety conditions",
      "Verify backstage facilities",
      "Organize equipment placement on stage",
      "Test stage lighting visibility",
      "Ensure cables are secured safely",
      "Confirm power outlets availability",
      "Prepare merchandise area if applicable",
      "Verify dressing room setup",
      "Check audience entry and seating arrangements",
    ],
  },
  {
    title: "Before the Performance",
    items: [
      "Arrive early at venue",
      "Complete soundcheck and equipment testing",
      "Tune instruments one final time",
      "Warm up vocals or instruments",
      "Review setlist and cues",
      "Check stage setup and positioning",
      "Confirm recording or streaming setup if applicable",
      "Relax and focus mentally before performance",
      "Ensure all performers are ready on time",
      "Secure valuables and personal belongings",
    ],
  },
  {
    title: "During the Performance",
    items: [
      "Follow setlist and timing schedule",
      "Monitor sound and technical issues",
      "Stay hydrated during breaks",
      "Maintain communication with sound engineers",
      "Watch stage safety and cable placement",
      "Engage with audience professionally",
      "Handle unexpected issues calmly",
      "Monitor equipment performance",
      "Keep backup equipment accessible",
      "Follow venue and event guidelines",
    ],
  },
  {
    title: "After the Performance",
    items: [
      "Thank audience, organizers, and crew",
      "Power down and pack equipment safely",
      "Inspect instruments and gear for damage",
      "Collect personal belongings",
      "Organize merchandise and payments if applicable",
      "Clean backstage and performance area",
      "Back up recordings or media files",
      "Recharge batteries and devices",
      "Review performance notes and feedback",
      "Store equipment properly after returning home",
    ],
  },
] as const;

const PODCAST_RECORDING_SETUP_CHECKLIST = [
  {
    title: "Episode Planning",
    items: [
      "Define podcast episode topic",
      "Prepare episode outline or script",
      "Confirm guest participation if applicable",
      "Schedule recording date and time",
      "Share recording instructions with guests",
      "Prepare interview questions or discussion points",
      "Review episode goals and key messages",
      "Plan episode duration and segment timing",
      "Prepare backup topics or filler content",
      "Confirm release schedule and deadlines",
    ],
  },
  {
    title: "Recording Space Preparation",
    items: [
      "Choose quiet recording location",
      "Minimize background noise",
      "Turn off noisy appliances and notifications",
      "Close windows and doors",
      "Test room acoustics and echo levels",
      "Prepare comfortable seating",
      "Arrange proper lighting if video recording",
      "Ensure recording area is clean and organized",
      "Place “Recording in Progress” notice if needed",
      "Prepare water and refreshments",
    ],
  },
  {
    title: "Audio Equipment Setup",
    items: [
      "Set up microphones",
      "Test microphone positioning",
      "Attach pop filters or windshields",
      "Connect audio interface or mixer",
      "Test headphones and monitoring audio",
      "Check microphone levels and gain settings",
      "Prepare backup microphone if available",
      "Organize cables and connections",
      "Ensure all equipment is powered properly",
      "Test audio quality before recording",
    ],
  },
  {
    title: "Computer and Software Preparation",
    items: [
      "Charge laptop or recording devices",
      "Open recording software",
      "Verify recording settings and audio format",
      "Create project/session file",
      "Test software input/output devices",
      "Prepare backup recording solution",
      "Check available storage space",
      "Disable unnecessary applications",
      "Turn off notifications and alerts",
      "Verify internet connection if remote recording",
    ],
  },
  {
    title: "Guest and Remote Recording Setup",
    items: [
      "Confirm guest connection details",
      "Test remote recording platform",
      "Verify guest microphone and audio quality",
      "Share headphone and microphone recommendations",
      "Confirm recording permissions and consent",
      "Prepare communication backup method",
      "Test video connection if applicable",
      "Confirm time zone and schedule coordination",
    ],
  },
  {
    title: "Podcast Branding and Materials",
    items: [
      "Prepare intro and outro music",
      "Organize sponsor or advertisement notes",
      "Prepare episode title ideas",
      "Verify branding assets and graphics",
      "Prepare social media promotion notes",
      "Organize sound effects if needed",
      "Review call-to-action messages",
      "Prepare show notes template",
    ],
  },
  {
    title: "Before Recording Starts",
    items: [
      "Conduct final audio test",
      "Check recording levels for all participants",
      "Verify backup recording is active",
      "Silence phones and devices",
      "Review episode structure with participants",
      "Prepare notes and talking points",
      "Warm up voice and speaking pace",
      "Confirm all participants are ready",
      "Start recording early for safety buffer",
      "Take a deep breath and relax before starting",
    ],
  },
  {
    title: "During Recording",
    items: [
      "Monitor audio levels continuously",
      "Speak clearly and consistently",
      "Minimize interruptions and background noise",
      "Keep water nearby",
      "Follow episode outline while staying natural",
      "Mark mistakes or retake moments if needed",
      "Monitor guest engagement and pacing",
      "Keep track of recording time",
      "Save project periodically if possible",
      "Maintain positive energy and flow",
    ],
  },
  {
    title: "After Recording",
    items: [
      "Stop and save recording properly",
      "Back up audio files immediately",
      "Label and organize files clearly",
      "Review audio quality briefly",
      "Note editing points or corrections",
      "Thank guests and participants",
      "Export or upload files if needed",
      "Recharge or power down equipment",
      "Clean and store recording gear",
      "Schedule editing and publishing tasks",
    ],
  },
] as const;

const PHOTOGRAPHY_DRONE_MISSION_CHECKLIST = [
  {
    title: "Mission Planning",
    items: [
      "Define mission objectives and shot list",
      "Confirm flight location and access permissions",
      "Review local drone laws and regulations",
      "Check restricted or controlled airspace",
      "Verify required licenses or certifications",
      "Review weather forecast and wind conditions",
      "Plan flight route and shooting angles",
      "Identify safe takeoff and landing zones",
      "Prepare backup flight plan if conditions change",
      "Inform team or observers about mission details",
    ],
  },
  {
    title: "Drone Inspection",
    items: [
      "Inspect drone body for visible damage",
      "Verify propellers are secure and undamaged",
      "Check motors for debris or obstruction",
      "Inspect landing gear condition",
      "Confirm gimbal movement and stabilization",
      "Clean camera lens and sensors",
      "Verify firmware is updated",
      "Check SD card availability and storage space",
      "Ensure GPS system is functioning properly",
      "Test remote controller operation",
    ],
  },
  {
    title: "Battery and Power Management",
    items: [
      "Fully charge drone batteries",
      "Fully charge controller batteries",
      "Charge mobile device or tablet",
      "Bring spare batteries",
      "Inspect batteries for swelling or damage",
      "Verify battery locking mechanisms",
      "Pack charging equipment and cables",
      "Check battery temperature before flight",
      "Plan battery usage for mission duration",
    ],
  },
  {
    title: "Camera and Photography Setup",
    items: [
      "Configure camera resolution and frame rate",
      "Set photo format (RAW/JPEG)",
      "Configure exposure and white balance",
      "Adjust ISO and shutter speed settings",
      "Verify memory card formatting",
      "Test camera recording functionality",
      "Prepare ND filters if needed",
      "Configure gimbal angle and stabilization",
      "Review planned compositions and framing",
      "Test focus and image sharpness",
    ],
  },
  {
    title: "Flight Environment Assessment",
    items: [
      "Inspect takeoff and landing area",
      "Check for nearby obstacles and hazards",
      "Assess electromagnetic interference risks",
      "Evaluate lighting conditions and sun position",
      "Confirm safe emergency landing areas",
      "Check visibility and weather stability",
      "Assess presence of people, vehicles, or animals",
      "Verify GPS signal strength",
      "Review terrain elevation and surroundings",
    ],
  },
  {
    title: "Navigation and Communication",
    items: [
      "Load flight route or waypoints if applicable",
      "Test communication between drone and controller",
      "Verify return-to-home settings",
      "Confirm home point accuracy",
      "Ensure maps and offline navigation are available",
      "Prepare communication devices for team coordination",
      "Save emergency contact numbers",
      "Check mobile network availability if needed",
    ],
  },
  {
    title: "Safety and Emergency Preparation",
    items: [
      "Pack first aid kit",
      "Carry fire extinguisher if required",
      "Prepare emergency landing procedures",
      "Review signal loss procedures",
      "Verify obstacle avoidance systems",
      "Prepare weather emergency plan",
      "Carry flashlight or headlamp if needed",
      "Bring reflective vest or safety gear if required",
      "Review local emergency regulations",
    ],
  },
  {
    title: "Before Takeoff",
    items: [
      "Conduct final drone inspection",
      "Confirm all equipment is secured",
      "Verify camera settings one final time",
      "Confirm sufficient satellite connection",
      "Start video recording if needed",
      "Check battery levels again",
      "Review flight path and objectives",
      "Ensure takeoff area is clear",
      "Announce takeoff to team or observers",
      "Perform controlled takeoff and hover test",
    ],
  },
  {
    title: "During the Mission",
    items: [
      "Maintain visual line of sight",
      "Monitor battery levels continuously",
      "Watch telemetry and GPS signal",
      "Monitor weather and wind changes",
      "Adjust camera settings as lighting changes",
      "Avoid restricted or crowded areas",
      "Maintain safe altitude and distance",
      "Capture backup shots and angles",
      "Monitor storage capacity during recording",
      "Be prepared for manual return or emergency landing",
    ],
  },
  {
    title: "After Landing",
    items: [
      "Power off drone and controller safely",
      "Inspect drone for damage or overheating",
      "Remove and store batteries safely",
      "Back up photos and videos immediately",
      "Review captured footage for quality",
      "Log mission details and observations",
      "Clean drone and camera equipment",
      "Recharge batteries if needed",
      "Pack all equipment securely",
      "Report incidents or anomalies if required",
    ],
  },
] as const;

const BUSINESS_CONFERENCE_CHECKLIST = [
  {
    title: "Conference Planning",
    items: [
      "Define conference goals and target audience",
      "Select conference theme and topics",
      "Set conference date and duration",
      "Establish event budget",
      "Create planning timeline and milestones",
      "Define team roles and responsibilities",
      "Estimate expected number of attendees",
      "Choose event format (in-person, hybrid, virtual)",
      "Identify key sponsors and partners",
      "Prepare risk management and contingency plans",
    ],
  },
  {
    title: "Venue and Logistics",
    items: [
      "Book conference venue",
      "Confirm room capacities and layouts",
      "Arrange stage and seating setup",
      "Verify audio/visual equipment availability",
      "Check internet and Wi-Fi access",
      "Arrange signage and directional materials",
      "Confirm parking and transportation options",
      "Ensure accessibility requirements are met",
      "Review venue safety and emergency procedures",
      "Confirm setup and teardown schedules",
    ],
  },
  {
    title: "Speakers and Agenda",
    items: [
      "Identify and invite speakers",
      "Confirm speaker participation",
      "Collect speaker bios and photos",
      "Prepare conference agenda and schedule",
      "Coordinate presentation requirements",
      "Arrange moderator or host assignments",
      "Confirm panel discussion participants",
      "Schedule networking and break sessions",
      "Prepare backup speakers if needed",
      "Share event timeline with speakers",
    ],
  },
  {
    title: "Registration and Attendee Management",
    items: [
      "Set up registration system",
      "Create ticketing or attendee categories",
      "Prepare attendee confirmation emails",
      "Track registrations and attendance numbers",
      "Organize attendee badges and materials",
      "Prepare welcome packets or swag bags",
      "Set up check-in procedures",
      "Confirm attendee communication channels",
      "Handle dietary and accessibility requests",
      "Prepare attendee support contacts",
    ],
  },
  {
    title: "Marketing and Promotion",
    items: [
      "Create conference branding and visuals",
      "Build event landing page",
      "Promote conference on social media",
      "Send email marketing campaigns",
      "Coordinate sponsor promotions",
      "Prepare press/media outreach",
      "Design promotional materials and banners",
      "Publish speaker announcements",
      "Monitor registration trends",
      "Schedule reminder communications",
    ],
  },
  {
    title: "Technology and Equipment",
    items: [
      "Test microphones and sound systems",
      "Verify projectors and presentation screens",
      "Prepare presentation clickers and adapters",
      "Test video conferencing tools if hybrid/virtual",
      "Arrange live streaming setup if needed",
      "Prepare backup laptops and cables",
      "Confirm charging stations for attendees",
      "Test internet connectivity",
      "Prepare recording equipment",
      "Back up all presentation files",
    ],
  },
  {
    title: "Catering and Hospitality",
    items: [
      "Finalize catering menu",
      "Confirm coffee breaks and meal schedules",
      "Verify attendee dietary requirements",
      "Arrange water stations",
      "Organize VIP or speaker hospitality",
      "Confirm catering setup times",
      "Prepare staff/volunteer meals if needed",
      "Arrange cleanup procedures with caterers",
    ],
  },
  {
    title: "Staffing and Volunteers",
    items: [
      "Recruit event staff or volunteers",
      "Assign event-day responsibilities",
      "Conduct briefing/training sessions",
      "Prepare staff schedules",
      "Share emergency procedures with team",
      "Assign technical support personnel",
      "Prepare communication tools for staff",
      "Confirm dress code or badges for staff",
    ],
  },
  {
    title: "Before the Conference Starts",
    items: [
      "Inspect venue setup",
      "Test all technical equipment",
      "Prepare registration/check-in desk",
      "Verify signage placement",
      "Confirm speaker arrivals",
      "Review event timeline with staff",
      "Prepare emergency contacts and procedures",
      "Ensure catering is ready",
      "Organize attendee materials and badges",
      "Conduct final walkthrough of the venue",
    ],
  },
  {
    title: "During the Conference",
    items: [
      "Monitor attendee check-in flow",
      "Keep sessions running on schedule",
      "Assist speakers and moderators",
      "Monitor audio/video quality",
      "Handle attendee questions and support",
      "Coordinate networking sessions",
      "Manage technical issues quickly",
      "Monitor catering and refreshments",
      "Take photos/videos of the event",
      "Track attendance and participation",
    ],
  },
  {
    title: "After the Conference",
    items: [
      "Thank speakers, sponsors, and attendees",
      "Collect attendee feedback and surveys",
      "Share presentation materials or recordings",
      "Review event performance and metrics",
      "Settle vendor and supplier payments",
      "Organize cleanup and equipment return",
      "Back up photos, videos, and documents",
      "Conduct post-event team review",
      "Prepare final conference report",
      "Plan improvements for future events",
    ],
  },
] as const;

const WORKSHOP_TRAINING_EVENT_CHECKLIST = [
  {
    title: "Event Planning",
    items: [
      "Define workshop/training objectives",
      "Identify target audience",
      "Select workshop topic and format",
      "Set event date and duration",
      "Establish budget and resources",
      "Define success criteria and expected outcomes",
      "Assign roles and responsibilities to organizers",
      "Create event timeline and milestones",
      "Determine participant capacity",
      "Prepare backup plans for unexpected issues",
    ],
  },
  {
    title: "Venue and Logistics",
    items: [
      "Book venue or online platform",
      "Confirm room setup and seating arrangement",
      "Verify audio/visual equipment availability",
      "Check internet and Wi-Fi access",
      "Arrange signage and directions",
      "Ensure accessibility requirements are met",
      "Confirm parking or transportation options",
      "Prepare breakout rooms if needed",
      "Review emergency exits and safety procedures",
      "Confirm setup and cleanup schedules",
    ],
  },
  {
    title: "Agenda and Training Materials",
    items: [
      "Prepare workshop agenda and schedule",
      "Create presentation slides",
      "Prepare training manuals or handouts",
      "Organize exercises and activities",
      "Prepare case studies or demonstrations",
      "Print participant materials if needed",
      "Prepare evaluation or feedback forms",
      "Test all presentation files and media",
      "Organize certificates of participation if applicable",
      "Prepare backup copies of all materials",
    ],
  },
  {
    title: "Trainers and Speakers",
    items: [
      "Confirm trainers or speakers",
      "Share event agenda with trainers",
      "Collect trainer bios and introductions",
      "Review presentation requirements",
      "Arrange rehearsal or preparation session",
      "Confirm travel/accommodation if needed",
      "Prepare moderator or facilitator assignments",
      "Share participant expectations with trainers",
      "Confirm communication methods during the event",
      "Prepare backup trainer if possible",
    ],
  },
  {
    title: "Registration and Participant Management",
    items: [
      "Set up registration system",
      "Send confirmation emails to participants",
      "Track attendee registrations",
      "Prepare name badges or attendee lists",
      "Share workshop schedule and instructions",
      "Handle dietary or accessibility requests",
      "Prepare welcome materials",
      "Organize check-in procedures",
      "Confirm participant communication channels",
      "Send reminders before the event",
    ],
  },
  {
    title: "Technology and Equipment",
    items: [
      "Test microphones and speakers",
      "Verify projector or display screens",
      "Prepare laptops and adapters",
      "Test online meeting platform if virtual/hybrid",
      "Arrange charging stations or extension cords",
      "Prepare backup internet connection if possible",
      "Test interactive tools or software",
      "Bring clickers and presentation remotes",
      "Ensure all devices are fully charged",
      "Prepare recording equipment if needed",
    ],
  },
  {
    title: "Catering and Hospitality",
    items: [
      "Arrange coffee breaks and refreshments",
      "Confirm meal or snack orders",
      "Verify dietary requirements",
      "Prepare water stations",
      "Organize trainer/speaker hospitality",
      "Confirm catering delivery times",
      "Arrange cleanup after catering service",
    ],
  },
  {
    title: "Before the Event Starts",
    items: [
      "Inspect venue or online setup",
      "Test all technical equipment",
      "Organize training materials and supplies",
      "Prepare registration/check-in desk",
      "Verify seating arrangement",
      "Review event schedule with staff/trainers",
      "Confirm arrival of trainers and participants",
      "Prepare emergency contact information",
      "Place signage and directions",
      "Conduct final walkthrough or system check",
    ],
  },
  {
    title: "During the Workshop / Training",
    items: [
      "Welcome participants",
      "Monitor attendance and check-ins",
      "Keep sessions on schedule",
      "Assist trainers with technical needs",
      "Facilitate participant engagement",
      "Monitor audio/video quality",
      "Coordinate breaks and networking time",
      "Handle participant questions and support",
      "Resolve technical or logistical issues quickly",
      "Collect photos/videos if appropriate",
    ],
  },
  {
    title: "After the Event",
    items: [
      "Collect feedback forms and surveys",
      "Thank participants and trainers",
      "Share workshop materials or recordings",
      "Send certificates if applicable",
      "Review event performance and outcomes",
      "Organize cleanup and equipment return",
      "Back up presentations and event files",
      "Document lessons learned",
      "Prepare post-event summary/report",
      "Plan improvements for future workshops",
    ],
  },
] as const;

const ONLINE_WEBINAR_CHECKLIST = [
  {
    title: "Webinar Planning",
    items: [
      "Define webinar topic and objectives",
      "Identify target audience",
      "Select webinar date and time",
      "Determine webinar format and duration",
      "Create webinar agenda and schedule",
      "Define speaker and moderator roles",
      "Set participant capacity if needed",
      "Prepare backup plan for technical issues",
      "Establish success metrics and goals",
      "Confirm legal/privacy requirements if recording",
    ],
  },
  {
    title: "Webinar Platform Setup",
    items: [
      "Select webinar platform",
      "Verify platform subscription and participant limits",
      "Configure webinar settings and permissions",
      "Enable registration if required",
      "Set up waiting room or attendee controls",
      "Configure screen sharing permissions",
      "Test recording functionality",
      "Set up polls, Q&A, or chat features",
      "Customize webinar branding and visuals",
      "Prepare backup meeting link/platform",
    ],
  },
  {
    title: "Presenter Preparation",
    items: [
      "Confirm presenters and moderators",
      "Share agenda and speaking schedule",
      "Prepare presentation slides",
      "Rehearse presentations and timing",
      "Test microphones and cameras",
      "Check lighting and background setup",
      "Prepare speaker notes",
      "Ensure presenters have stable internet connection",
      "Prepare backup devices if needed",
      "Confirm presenter login credentials",
    ],
  },
  {
    title: "Technical Equipment",
    items: [
      "Charge laptops and devices",
      "Test webcam quality",
      "Test microphone and audio quality",
      "Verify headphones or speakers",
      "Prepare backup internet connection",
      "Test screen sharing functionality",
      "Close unnecessary applications",
      "Disable distracting notifications",
      "Prepare power adapters and chargers",
      "Test webinar recording storage availability",
    ],
  },
  {
    title: "Marketing and Registration",
    items: [
      "Create webinar registration page",
      "Send invitation emails",
      "Promote webinar on social media",
      "Share webinar access instructions",
      "Send reminder emails before the event",
      "Track attendee registrations",
      "Prepare attendee confirmation emails",
      "Share calendar invitations",
      "Prepare follow-up communication plan",
      "Confirm attendance expectations",
    ],
  },
  {
    title: "Webinar Content and Materials",
    items: [
      "Finalize presentation slides",
      "Prepare demonstration materials if needed",
      "Organize downloadable resources",
      "Prepare opening and closing remarks",
      "Create audience engagement questions",
      "Prepare polls or quizzes",
      "Organize FAQ responses",
      "Verify all links and media work correctly",
      "Prepare backup copy of presentation files",
      "Test videos or embedded media",
    ],
  },
  {
    title: "Before the Webinar Starts",
    items: [
      "Start webinar platform early",
      "Test audio and video one final time",
      "Verify recording is enabled if needed",
      "Confirm presenters are connected",
      "Open presentation materials",
      "Prepare chat/Q&A moderation tools",
      "Review webinar agenda with presenters",
      "Ensure stable internet connection",
      "Admit participants if using waiting room",
      "Welcome attendees before starting",
    ],
  },
  {
    title: "During the Webinar",
    items: [
      "Introduce presenters and agenda",
      "Monitor audio and video quality",
      "Keep webinar on schedule",
      "Moderate chat and Q&A",
      "Launch polls or engagement activities",
      "Assist presenters with technical issues",
      "Monitor participant attendance",
      "Record important questions or feedback",
      "Handle disruptions or inappropriate behavior",
      "Announce next steps or follow-up information",
    ],
  },
  {
    title: "After the Webinar",
    items: [
      "Stop and save webinar recording",
      "Thank attendees and presenters",
      "Send follow-up emails",
      "Share recording and presentation materials",
      "Review attendee feedback and survey responses",
      "Analyze webinar attendance and engagement metrics",
      "Archive webinar files and recordings",
      "Document lessons learned",
      "Follow up with leads or participants if applicable",
      "Plan improvements for future webinars",
    ],
  },
] as const;

const OFFICE_LAUNCH_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Define office requirements and goals",
      "Establish project budget",
      "Set office launch timeline",
      "Assign responsibilities to project team",
      "Determine office capacity and workspace layout",
      "Confirm legal and compliance requirements",
      "Prepare risk management and contingency plans",
      "Define communication plan for employees and stakeholders",
      "Review lease agreement and office policies",
      "Schedule key milestone reviews",
    ],
  },
  {
    title: "Office Space and Infrastructure",
    items: [
      "Finalize office lease or purchase agreement",
      "Inspect office space condition",
      "Confirm utilities setup (electricity, water, internet)",
      "Arrange office cleaning services",
      "Verify heating, ventilation, and air conditioning systems",
      "Ensure fire safety compliance",
      "Check emergency exits and evacuation plans",
      "Install security systems and access controls",
      "Arrange parking and transportation access",
      "Confirm accessibility requirements are met",
    ],
  },
  {
    title: "Furniture and Equipment",
    items: [
      "Order desks and chairs",
      "Arrange meeting room furniture",
      "Set up storage cabinets and shelves",
      "Install office signage and branding",
      "Prepare kitchen and breakroom equipment",
      "Arrange printers and office devices",
      "Install conference room technology",
      "Verify ergonomic workstation setup",
      "Organize office supplies and stationery",
      "Test all office equipment functionality",
    ],
  },
  {
    title: "IT and Technology Setup",
    items: [
      "Install internet and Wi-Fi network",
      "Configure employee workstations",
      "Set up laptops and desktop computers",
      "Install required software and licenses",
      "Configure email accounts and communication tools",
      "Implement cybersecurity measures",
      "Set up printers and shared devices",
      "Configure backup and recovery systems",
      "Test video conferencing systems",
      "Verify network security and access permissions",
    ],
  },
  {
    title: "Employee Preparation",
    items: [
      "Notify employees about office launch date",
      "Share office access instructions",
      "Prepare onboarding materials if needed",
      "Assign desks and workspaces",
      "Provide office policies and procedures",
      "Arrange employee ID badges or access cards",
      "Schedule orientation or office tour",
      "Confirm remote/hybrid work arrangements if applicable",
      "Prepare emergency contact information",
      "Organize welcome kits or materials",
    ],
  },
  {
    title: "Operations and Administration",
    items: [
      "Register office address where required",
      "Update company contact information",
      "Arrange mail and package handling",
      "Set up cleaning and maintenance contracts",
      "Confirm insurance coverage",
      "Prepare visitor management procedures",
      "Organize waste disposal and recycling",
      "Establish office opening/closing procedures",
      "Set up inventory management for supplies",
      "Verify vendor and supplier agreements",
    ],
  },
  {
    title: "Health and Safety",
    items: [
      "Install first aid kits",
      "Verify fire extinguishers and alarms",
      "Prepare workplace safety guidelines",
      "Conduct safety inspections",
      "Confirm emergency response procedures",
      "Ensure ergonomic workstation setup",
      "Arrange sanitation and hygiene supplies",
      "Prepare incident reporting procedures",
      "Test emergency lighting systems",
      "Schedule safety training if required",
    ],
  },
  {
    title: "Before Office Opening",
    items: [
      "Conduct final office walkthrough",
      "Test all utilities and systems",
      "Verify internet and phone connectivity",
      "Ensure furniture and equipment are installed",
      "Organize meeting rooms and common areas",
      "Stock kitchen and office supplies",
      "Confirm security systems are active",
      "Test employee access systems",
      "Verify cleanliness and presentation of office",
      "Communicate final launch details to staff",
    ],
  },
  {
    title: "Office Launch Day",
    items: [
      "Welcome employees and guests",
      "Conduct office orientation or tour",
      "Monitor IT and facility systems",
      "Assist employees with setup issues",
      "Confirm meeting rooms and shared spaces work properly",
      "Handle operational issues quickly",
      "Ensure reception and visitor management are functioning",
      "Gather initial employee feedback",
      "Document launch-day issues and resolutions",
      "Celebrate successful office opening",
    ],
  },
  {
    title: "After Launch",
    items: [
      "Review office operations and workflows",
      "Collect employee feedback",
      "Resolve outstanding setup issues",
      "Monitor office supply levels",
      "Schedule regular maintenance and cleaning",
      "Review security and access logs",
      "Evaluate office space utilization",
      "Update operational documentation",
      "Plan improvements and optimizations",
      "Conduct post-launch project review",
    ],
  },
] as const;

const SPRING_CLEANING_HOME_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Create a room-by-room cleaning plan",
      "Set cleaning schedule and priorities",
      "Gather cleaning supplies and tools",
      "Prepare trash bags and storage boxes",
      "Open windows for ventilation",
      "Prepare donation or recycling boxes",
      "Check weather for outdoor maintenance tasks",
      "Wear protective gloves and clothing",
      "Prepare music or entertainment for motivation",
      "Ensure cleaning equipment is working properly",
    ],
  },
  {
    title: "General Decluttering",
    items: [
      "Remove unnecessary items from each room",
      "Organize closets and storage spaces",
      "Donate unused clothing and belongings",
      "Dispose of broken or expired items",
      "Organize paperwork and documents",
      "Recycle old electronics and batteries properly",
      "Sort seasonal decorations and supplies",
      "Label storage containers if needed",
      "Organize cables and chargers",
      "Clean and organize entryways",
    ],
  },
  {
    title: "Living Room and Common Areas",
    items: [
      "Dust furniture and shelves",
      "Clean windows and mirrors",
      "Vacuum carpets and rugs",
      "Mop hard floors",
      "Clean curtains or blinds",
      "Wipe down electronics and remote controls",
      "Clean light fixtures and ceiling fans",
      "Organize books, magazines, and decorations",
      "Vacuum upholstered furniture",
      "Check smoke detectors and batteries",
    ],
  },
  {
    title: "Kitchen Cleaning and Maintenance",
    items: [
      "Clean refrigerator and freezer",
      "Dispose of expired food",
      "Wipe kitchen cabinets and countertops",
      "Deep clean oven and stovetop",
      "Clean microwave and small appliances",
      "Sanitize sink and garbage disposal",
      "Organize pantry and food storage",
      "Mop kitchen floor",
      "Check plumbing for leaks",
      "Inspect fire extinguisher and kitchen safety equipment",
    ],
  },
  {
    title: "Bathroom Cleaning and Maintenance",
    items: [
      "Scrub toilets, sinks, and showers",
      "Clean mirrors and glass surfaces",
      "Wash bath mats and towels",
      "Check for mold or mildew",
      "Organize toiletries and cabinets",
      "Clean drains and remove buildup",
      "Test ventilation fan",
      "Inspect plumbing for leaks",
      "Replace worn shower curtains or liners",
      "Refill hygiene and cleaning supplies",
    ],
  },
  {
    title: "Bedroom Cleaning and Organization",
    items: [
      "Wash bedding and pillows",
      "Rotate or flip mattresses if needed",
      "Vacuum under beds and furniture",
      "Organize closets and drawers",
      "Donate unused clothing",
      "Dust furniture and decor",
      "Clean windows and blinds",
      "Organize bedside tables",
      "Check smoke alarms in bedrooms",
      "Store seasonal clothing appropriately",
    ],
  },
  {
    title: "Laundry and Utility Areas",
    items: [
      "Clean washing machine and dryer",
      "Remove lint from dryer vents",
      "Organize cleaning supplies",
      "Inspect water heater for leaks",
      "Check utility connections and hoses",
      "Sweep and mop floors",
      "Organize tools and maintenance supplies",
      "Replace HVAC filters if needed",
      "Test sump pump if applicable",
      "Inspect electrical panels for issues",
    ],
  },
  {
    title: "Outdoor Cleaning and Maintenance",
    items: [
      "Sweep patios, decks, and balconies",
      "Clean outdoor furniture",
      "Wash exterior windows",
      "Inspect roof and gutters",
      "Remove leaves and debris",
      "Check fences and gates",
      "Inspect exterior lighting",
      "Clean garage or storage shed",
      "Check garden tools and equipment",
      "Prepare lawn and garden for the season",
    ],
  },
  {
    title: "Home Safety and Maintenance",
    items: [
      "Test smoke and carbon monoxide detectors",
      "Inspect fire extinguishers",
      "Check door and window locks",
      "Inspect electrical outlets and cords",
      "Verify emergency supplies and first aid kit",
      "Test heating and cooling systems",
      "Inspect for signs of pests",
      "Check caulking and weather seals",
      "Review home security systems",
      "Prepare maintenance repair list",
    ],
  },
  {
    title: "Final Review and Organization",
    items: [
      "Take out trash and recycling",
      "Return cleaning supplies to storage",
      "Organize cleaned spaces neatly",
      "Review completed maintenance tasks",
      "Schedule professional repairs if needed",
      "Back up important home documents",
      "Refresh home decor if desired",
      "Enjoy clean and organized living spaces",
      "Plan regular cleaning routine moving forward",
      "Celebrate completion of spring cleaning tasks",
    ],
  },
] as const;

const WINTER_HOME_PREPARATION_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Review winter weather forecasts for the area",
      "Create winter maintenance schedule",
      "Prepare emergency contact information",
      "Inspect property insurance coverage",
      "Gather winter maintenance tools and supplies",
      "Schedule professional inspections if needed",
      "Plan snow removal arrangements",
      "Prepare backup heating options",
      "Inform neighbors or property manager if property will be vacant",
      "Check local winter safety recommendations",
    ],
  },
  {
    title: "Heating System Preparation",
    items: [
      "Test heating system functionality",
      "Replace HVAC or furnace filters",
      "Schedule furnace or boiler maintenance",
      "Inspect radiators and vents",
      "Test thermostats",
      "Verify chimney and fireplace safety",
      "Clean fireplace and remove old ash",
      "Stock firewood if applicable",
      "Check carbon monoxide detectors",
      "Ensure heating fuel supply is sufficient",
    ],
  },
  {
    title: "Plumbing and Water Protection",
    items: [
      "Insulate exposed pipes",
      "Drain outdoor hoses and faucets",
      "Shut off exterior water supply if needed",
      "Test water heater functionality",
      "Check for plumbing leaks",
      "Prepare pipe heating cables if necessary",
      "Insulate water tanks and vulnerable plumbing areas",
      "Learn location of main water shutoff valve",
      "Prevent freezing in unused rooms",
      "Prepare emergency plumbing repair supplies",
    ],
  },
  {
    title: "Exterior Maintenance",
    items: [
      "Inspect roof for damage or leaks",
      "Clean gutters and downspouts",
      "Remove leaves and debris from yard",
      "Trim tree branches near roof or power lines",
      "Inspect siding and exterior walls",
      "Seal cracks and openings",
      "Check foundation drainage",
      "Inspect driveway and walkways for hazards",
      "Store outdoor furniture safely",
      "Prepare snow shovels and ice melt supplies",
    ],
  },
  {
    title: "Windows and Doors",
    items: [
      "Inspect window seals and insulation",
      "Install weather stripping if needed",
      "Seal air leaks around doors and windows",
      "Check storm windows or shutters",
      "Verify door locks function properly",
      "Install draft blockers if necessary",
      "Clean windows before winter season",
      "Prepare curtains or thermal coverings",
    ],
  },
  {
    title: "Electrical and Safety Systems",
    items: [
      "Test smoke detectors",
      "Test carbon monoxide alarms",
      "Inspect electrical outlets and cords",
      "Verify backup generators if available",
      "Prepare flashlights and spare batteries",
      "Check outdoor lighting functionality",
      "Ensure emergency exits are accessible",
      "Review home security system operation",
      "Prepare emergency power supplies",
      "Inspect surge protectors and breakers",
    ],
  },
  {
    title: "Interior Preparation",
    items: [
      "Deep clean living spaces",
      "Store seasonal items appropriately",
      "Prepare winter bedding and blankets",
      "Check indoor humidity levels",
      "Organize emergency supplies indoors",
      "Prepare food and water reserves",
      "Inspect furniture near heating sources",
      "Store valuables securely if property will be vacant",
      "Clean and inspect ventilation systems",
      "Prepare indoor entertainment and comfort items",
    ],
  },
  {
    title: "Vacation Home Specific Tasks",
    items: [
      "Shut off unnecessary utilities if vacant",
      "Set thermostat to safe minimum temperature",
      "Arrange regular property inspections",
      "Empty refrigerator/freezer if shutting down property",
      "Remove perishable food items",
      "Secure windows and doors",
      "Stop mail or package deliveries",
      "Notify local contacts about vacancy",
      "Install smart monitoring devices if available",
      "Prepare snow removal access instructions",
    ],
  },
  {
    title: "Emergency Preparedness",
    items: [
      "Prepare first aid kit",
      "Store bottled water and non-perishable food",
      "Keep emergency blankets accessible",
      "Save emergency service numbers",
      "Prepare battery-powered radio",
      "Stock ice melt and sand",
      "Keep vehicle winter emergency kit ready",
      "Plan evacuation routes if necessary",
      "Prepare backup communication methods",
      "Review emergency procedures with household members",
    ],
  },
  {
    title: "Before Winter Arrives",
    items: [
      "Conduct final property walkthrough",
      "Verify heating system is operating properly",
      "Double-check insulation and weatherproofing",
      "Ensure all emergency supplies are stocked",
      "Test backup systems and generators",
      "Confirm snow removal equipment is accessible",
      "Secure all outdoor equipment and decorations",
      "Review weather alerts and forecasts",
      "Lock and secure all entrances",
      "Prepare property for severe winter conditions",
    ],
  },
  {
    title: "During Winter Season",
    items: [
      "Monitor heating and utility systems regularly",
      "Remove snow and ice from walkways",
      "Check roof and gutters after storms",
      "Watch for frozen pipes or leaks",
      "Inspect property for storm damage",
      "Maintain safe indoor temperature",
      "Keep emergency supplies replenished",
      "Monitor weather warnings and advisories",
      "Ventilate home properly when needed",
      "Schedule repairs promptly if issues occur",
    ],
  },
] as const;

const MOVING_NEW_HOME_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Confirm moving date and schedule",
      "Notify landlord or current property manager if applicable",
      "Hire moving company or arrange transportation",
      "Create moving budget",
      "Prepare inventory of belongings",
      "Gather packing supplies and boxes",
      "Label boxes by room and contents",
      "Arrange storage if needed",
      "Prepare emergency contact information",
      "Share new address with family and friends",
    ],
  },
  {
    title: "Address and Administrative Updates",
    items: [
      "Update mailing address",
      "Notify banks and financial institutions",
      "Update insurance information",
      "Change address for subscriptions and deliveries",
      "Update driver's license or ID if required",
      "Notify employer and schools",
      "Transfer or set up utilities",
      "Update voter registration if applicable",
      "Notify healthcare providers",
      "Save copies of important moving documents",
    ],
  },
  {
    title: "Packing and Organization",
    items: [
      "Sort and declutter belongings",
      "Donate or discard unnecessary items",
      "Pack fragile items securely",
      "Prepare essentials box for first day/night",
      "Pack valuables separately",
      "Label important boxes clearly",
      "Disassemble large furniture if needed",
      "Secure cables and electronics",
      "Pack cleaning supplies for move-in",
      "Prepare toolkit for furniture assembly",
    ],
  },
  {
    title: "Utilities and Services",
    items: [
      "Activate electricity and water services",
      "Set up internet and Wi-Fi",
      "Arrange gas service if needed",
      "Verify heating and cooling systems",
      "Test smoke detectors and alarms",
      "Confirm garbage and recycling services",
      "Check plumbing and water pressure",
      "Verify all lights and outlets work",
      "Arrange home security system if desired",
      "Prepare spare keys",
    ],
  },
  {
    title: "Before Moving Day",
    items: [
      "Confirm moving company arrival time",
      "Reserve elevator or parking if necessary",
      "Charge phones and electronic devices",
      "Prepare snacks and water",
      "Clean current home before leaving",
      "Defrost refrigerator/freezer if moving appliances",
      "Secure important documents and valuables",
      "Check weather forecast",
      "Pack overnight bag",
      "Do final walkthrough of old home",
    ],
  },
  {
    title: "Arrival at the New Home",
    items: [
      "Inspect home for damage or issues",
      "Verify utilities are working",
      "Unlock and secure all entrances",
      "Check heating, cooling, and ventilation",
      "Confirm internet setup",
      "Locate circuit breaker and water shutoff",
      "Test smoke detectors and locks",
      "Direct movers to correct rooms",
      "Assemble essential furniture first",
      "Unpack essentials box",
    ],
  },
  {
    title: "Cleaning and Setup",
    items: [
      "Clean kitchen and bathrooms",
      "Wipe surfaces and floors",
      "Install shower curtains and toiletries",
      "Set up beds and bedding",
      "Organize kitchen essentials",
      "Arrange furniture placement",
      "Set up workspace or office area",
      "Install curtains or blinds if needed",
      "Dispose of packing materials and trash",
      "Organize storage spaces",
    ],
  },
  {
    title: "Safety and Security",
    items: [
      "Change locks if necessary",
      "Test home alarm/security systems",
      "Locate emergency exits",
      "Prepare first aid kit",
      "Check fire extinguishers",
      "Verify outdoor lighting",
      "Secure windows and doors",
      "Save local emergency numbers",
      "Meet neighbors if possible",
      "Review neighborhood safety information",
    ],
  },
  {
    title: "After Moving In",
    items: [
      "Unpack remaining boxes gradually",
      "Organize closets and storage areas",
      "Register appliances or warranties if needed",
      "Check for maintenance or repair needs",
      "Confirm all mail is arriving correctly",
      "Update online delivery addresses",
      "Explore local services and stores",
      "Set up regular cleaning routine",
      "Review moving expenses and receipts",
      "Celebrate settling into the new home",
    ],
  },
] as const;

const RENTAL_PROPERTY_INSPECTION_CHECKLIST = [
  {
    title: "Legal and Documentation",
    items: [
      "Verify property ownership documents",
      "Prepare rental agreement or lease contract",
      "Confirm local rental regulations and compliance",
      "Check property insurance coverage",
      "Prepare inventory list for furnished properties",
      "Verify utility account setup",
      "Prepare emergency contact information",
      "Confirm smoke and safety certifications if required",
      "Organize copies of keys and access devices",
      "Prepare tenant information package",
    ],
  },
  {
    title: "Exterior Inspection",
    items: [
      "Inspect roof for visible damage or leaks",
      "Check gutters and drainage systems",
      "Inspect exterior walls and paint condition",
      "Verify doors and locks function properly",
      "Check windows for damage and proper sealing",
      "Inspect outdoor lighting",
      "Verify fences and gates are secure",
      "Check driveway and walkways for hazards",
      "Inspect garden or landscaping condition",
      "Remove debris and clean exterior areas",
    ],
  },
  {
    title: "Interior General Inspection",
    items: [
      "Inspect walls, ceilings, and floors for damage",
      "Check doors and handles",
      "Verify all locks work correctly",
      "Test windows and blinds",
      "Inspect stairs and railings for safety",
      "Ensure all rooms are clean and odor-free",
      "Verify proper ventilation",
      "Check for signs of mold or moisture",
      "Confirm pest control issues are resolved",
      "Inspect storage spaces and closets",
    ],
  },
  {
    title: "Electrical System",
    items: [
      "Test all light switches and fixtures",
      "Verify power outlets function properly",
      "Inspect circuit breakers and fuse box",
      "Check smoke detectors and carbon monoxide alarms",
      "Test intercom or security systems if applicable",
      "Verify internet/cable connections",
      "Replace burnt-out light bulbs",
      "Ensure extension cords are removed or organized safely",
    ],
  },
  {
    title: "Plumbing and Water Systems",
    items: [
      "Test sinks, faucets, and showers",
      "Check toilets for leaks or flushing issues",
      "Inspect water pressure",
      "Verify hot water system functionality",
      "Check under sinks for leaks",
      "Test drains for proper flow",
      "Inspect washing machine connections",
      "Verify dishwasher operation if included",
      "Ensure no visible pipe damage",
    ],
  },
  {
    title: "Kitchen Inspection",
    items: [
      "Test stove and oven functionality",
      "Verify refrigerator operation",
      "Inspect microwave and appliances",
      "Check kitchen cabinets and drawers",
      "Ensure countertops are clean and undamaged",
      "Test exhaust fan or ventilation system",
      "Verify sink and garbage disposal functionality",
      "Inspect tile and backsplash condition",
      "Ensure fire extinguisher is available if required",
    ],
  },
  {
    title: "Bathroom Inspection",
    items: [
      "Inspect shower, bathtub, and sink condition",
      "Test toilet functionality",
      "Verify ventilation fan operation",
      "Check mirrors and cabinets",
      "Inspect tiles and grout for damage",
      "Ensure water drains properly",
      "Test towel racks and fixtures",
      "Confirm no mold or mildew is present",
    ],
  },
  {
    title: "Heating, Cooling, and Safety",
    items: [
      "Test heating system",
      "Test air conditioning system",
      "Replace HVAC filters if needed",
      "Verify thermostat operation",
      "Inspect fire extinguishers",
      "Confirm emergency exits are accessible",
      "Test security alarms if installed",
      "Verify all safety equipment is operational",
    ],
  },
  {
    title: "Cleaning and Presentation",
    items: [
      "Deep clean all rooms",
      "Clean windows and mirrors",
      "Vacuum and mop floors",
      "Remove personal belongings",
      "Neutralize odors",
      "Organize furniture if furnished",
      "Improve lighting and presentation",
      "Ensure property is photo-ready for listings",
      "Prepare welcome or instruction materials for tenants",
    ],
  },
  {
    title: "Final Pre-Rental Review",
    items: [
      "Conduct final walkthrough inspection",
      "Take photos/videos of property condition",
      "Verify all repairs are completed",
      "Test all appliances one final time",
      "Confirm utilities are active",
      "Ensure keys/access devices are ready",
      "Review rental listing accuracy",
      "Prepare move-in checklist for tenant",
      "Confirm contact information for maintenance issues",
      "Lock and secure property after inspection",
    ],
  },
] as const;

const AIRBNB_GUEST_PREPARATION_CHECKLIST = [
  {
    title: "Booking and Communication",
    items: [
      "Confirm reservation details",
      "Send check-in instructions to guest",
      "Share property address and directions",
      "Provide Wi-Fi information",
      "Confirm arrival and departure times",
      "Answer guest questions before arrival",
      "Share parking instructions if applicable",
      "Provide emergency contact information",
      "Send house rules and policies",
      "Confirm number of guests",
    ],
  },
  {
    title: "Cleaning and Hygiene",
    items: [
      "Deep clean all rooms",
      "Vacuum and mop floors",
      "Dust furniture and surfaces",
      "Clean windows and mirrors",
      "Sanitize bathroom and kitchen areas",
      "Empty trash bins",
      "Replace trash bags",
      "Wash and change bed linens",
      "Replace towels and toiletries",
      "Eliminate odors and improve ventilation",
    ],
  },
  {
    title: "Bedroom Preparation",
    items: [
      "Make beds with clean linens",
      "Provide extra pillows and blankets",
      "Ensure bedside lighting works",
      "Prepare hangers and closet space",
      "Check curtains or blinds functionality",
      "Place fresh towels in room",
      "Provide charging outlets access",
      "Ensure room temperature is comfortable",
      "Remove personal belongings from guest areas",
    ],
  },
  {
    title: "Bathroom Preparation",
    items: [
      "Clean toilet, sink, shower, and bathtub",
      "Refill soap, shampoo, and toilet paper",
      "Provide clean towels and bath mats",
      "Check hot water availability",
      "Ensure drains work properly",
      "Test bathroom lighting and ventilation",
      "Place waste bin with liner",
      "Inspect for leaks or maintenance issues",
    ],
  },
  {
    title: "Kitchen Preparation",
    items: [
      "Clean countertops and appliances",
      "Empty refrigerator of old items",
      "Provide basic cooking utensils",
      "Check stove, oven, and microwave functionality",
      "Refill coffee, tea, sugar, or essentials if offered",
      "Ensure dishes and cutlery are clean",
      "Empty dishwasher if necessary",
      "Verify garbage disposal and trash setup",
      "Provide cleaning supplies or instructions",
    ],
  },
  {
    title: "Safety and Maintenance",
    items: [
      "Test smoke detectors",
      "Check carbon monoxide detectors",
      "Verify fire extinguisher availability",
      "Inspect locks and door security",
      "Ensure emergency exits are accessible",
      "Test heating and air conditioning",
      "Verify internet and Wi-Fi functionality",
      "Check all lights and electrical outlets",
      "Inspect plumbing and water pressure",
      "Fix visible maintenance issues",
    ],
  },
  {
    title: "Guest Experience and Comfort",
    items: [
      "Prepare welcome message or guidebook",
      "Provide local recommendations and maps",
      "Ensure TV and entertainment systems work",
      "Add decorative touches for presentation",
      "Provide spare keys or smart lock instructions",
      "Check outdoor areas and seating",
      "Ensure adequate lighting around entrances",
      "Prepare information about public transport or nearby stores",
      "Stock extra essentials if possible",
    ],
  },
  {
    title: "Before Guest Arrival",
    items: [
      "Conduct final walkthrough inspection",
      "Double-check cleanliness and presentation",
      "Ensure property smells fresh",
      "Set comfortable room temperature",
      "Confirm check-in instructions were sent",
      "Prepare self-check-in setup if applicable",
      "Ensure keys/access codes are ready",
      "Verify parking availability",
      "Turn on exterior lights if arriving late",
      "Secure personal or restricted areas",
    ],
  },
  {
    title: "During Guest Stay",
    items: [
      "Be available for questions or emergencies",
      "Respond promptly to guest messages",
      "Monitor any maintenance issues",
      "Respect guest privacy",
      "Offer assistance if needed",
      "Track check-out schedule",
    ],
  },
  {
    title: "After Guest Check-Out",
    items: [
      "Inspect property for damage",
      "Collect forgotten items",
      "Wash linens and towels",
      "Deep clean property again",
      "Restock supplies and toiletries",
      "Check appliances and utilities",
      "Dispose of trash properly",
      "Reset locks or access codes if needed",
      "Review guest feedback",
      "Prepare property for next booking",
    ],
  },
] as const;

const CAR_SERVICE_CHECKLIST = [
  {
    title: "Service Planning",
    items: [
      "Schedule service appointment",
      "Review recommended maintenance intervals",
      "Identify current vehicle issues or warning signs",
      "Check warranty or service coverage",
      "Confirm service center location and hours",
      "Prepare estimated service budget",
      "Review previous service records",
      "Verify roadside assistance information",
      "Arrange transportation during service if needed",
      "Confirm required parts availability if known",
    ],
  },
  {
    title: "Vehicle Inspection Before Service",
    items: [
      "Check fuel level",
      "Inspect tire pressure and condition",
      "Note unusual noises or vibrations",
      "Check dashboard warning lights",
      "Inspect windshield and wipers",
      "Check exterior lights functionality",
      "Inspect fluid leak signs",
      "Test brakes for unusual behavior",
      "Verify air conditioning/heating operation",
      "Record current mileage",
    ],
  },
  {
    title: "Documentation and Information",
    items: [
      "Bring vehicle registration documents",
      "Carry insurance information",
      "Prepare warranty documents if applicable",
      "Bring service history records",
      "Prepare list of issues to report",
      "Save contact information for service center",
      "Confirm appointment confirmation details",
      "Prepare payment method",
    ],
  },
  {
    title: "Cleaning and Organization",
    items: [
      "Remove personal valuables from vehicle",
      "Empty unnecessary items from trunk",
      "Organize important documents",
      "Remove trash from interior",
      "Secure loose objects inside vehicle",
      "Remove child seats if necessary",
      "Clean vehicle enough for inspection access",
      "Ensure service technicians can access key areas",
    ],
  },
  {
    title: "Maintenance Requests Preparation",
    items: [
      "List requested maintenance services",
      "Note unusual sounds or driving behavior",
      "Identify performance issues",
      "Report fuel consumption concerns",
      "Mention warning lights or error messages",
      "Request tire rotation/alignment if needed",
      "Confirm oil change requirements",
      "Specify any accessory or electronics issues",
      "Prepare questions about future maintenance",
    ],
  },
  {
    title: "Technology and Security",
    items: [
      "Save radio/navigation settings if necessary",
      "Back up important navigation data",
      "Disable or remove dashcam if preferred",
      "Remove connected personal devices",
      "Prepare spare key if required",
      "Verify alarm/security instructions if needed",
      "Record current vehicle condition with photos if desired",
    ],
  },
  {
    title: "Before Leaving for Service",
    items: [
      "Double-check appointment time",
      "Verify service center address",
      "Check traffic and travel time",
      "Bring phone charger and essentials",
      "Confirm transportation home/work",
      "Ensure enough fuel to reach service center",
      "Lock or secure personal compartments",
      "Prepare emergency contacts if needed",
      "Arrive a few minutes early",
    ],
  },
  {
    title: "At the Service Center",
    items: [
      "Explain all vehicle concerns clearly",
      "Review requested services with technician/advisor",
      "Confirm estimated completion time",
      "Request cost estimate before work begins",
      "Ask about additional recommended services",
      "Confirm contact number for updates",
      "Clarify warranty coverage if applicable",
      "Review payment options",
      "Verify pickup instructions",
    ],
  },
  {
    title: "After Service Completion",
    items: [
      "Review completed service report",
      "Confirm all requested work was performed",
      "Check invoice and charges carefully",
      "Ask questions about recommendations",
      "Verify warning lights are cleared",
      "Test vehicle briefly before leaving",
      "Ensure service reminder was reset if applicable",
      "Store service records safely",
      "Schedule next maintenance if needed",
      "Monitor vehicle performance after service",
    ],
  },
] as const;

const PRE_TRIP_CAR_INSPECTION_CHECKLIST = [
  {
    title: "Engine and Fluids",
    items: [
      "Check engine oil level",
      "Inspect coolant level",
      "Check brake fluid level",
      "Verify power steering fluid level",
      "Inspect transmission fluid if applicable",
      "Check windshield washer fluid",
      "Inspect for visible fluid leaks under the car",
      "Verify fuel level is sufficient",
      "Check for unusual engine noises",
      "Inspect engine bay for loose components",
    ],
  },
  {
    title: "Tires and Wheels",
    items: [
      "Check tire pressure on all tires",
      "Inspect tire tread depth",
      "Look for tire damage or cracks",
      "Verify spare tire condition and pressure",
      "Check wheel bolts/nuts tightness",
      "Inspect rims for visible damage",
      "Confirm tire repair kit availability if applicable",
      "Test tire pressure monitoring system if installed",
    ],
  },
  {
    title: "Brakes and Suspension",
    items: [
      "Test brake pedal responsiveness",
      "Check parking brake operation",
      "Listen for unusual brake noises",
      "Inspect brake discs/pads visually if possible",
      "Test suspension for unusual movement or sounds",
      "Verify steering responsiveness",
      "Check for vibrations while steering",
    ],
  },
  {
    title: "Lights and Electrical Systems",
    items: [
      "Test headlights (low and high beam)",
      "Check brake lights",
      "Test turn signals",
      "Verify hazard lights",
      "Check reverse lights",
      "Inspect interior lighting",
      "Test horn functionality",
      "Verify dashboard warning lights",
      "Check battery condition if possible",
      "Test charging ports and electrical accessories",
    ],
  },
  {
    title: "Windows and Visibility",
    items: [
      "Inspect windshield for cracks or chips",
      "Test windshield wipers",
      "Verify washer spray operation",
      "Clean windows and mirrors",
      "Check side mirrors adjustment",
      "Inspect rearview mirror stability",
      "Ensure defrosters work properly",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Verify first aid kit availability",
      "Check fire extinguisher if carried",
      "Ensure warning triangle is available",
      "Pack reflective safety vest",
      "Confirm emergency roadside kit availability",
      "Carry jumper cables or jump starter",
      "Verify flashlight and spare batteries",
      "Pack towing rope if appropriate",
      "Carry spare fuses if needed",
    ],
  },
  {
    title: "Interior and Comfort",
    items: [
      "Test air conditioning and heating",
      "Verify seat adjustments",
      "Check seat belt functionality",
      "Secure loose items in vehicle",
      "Organize luggage properly",
      "Prepare phone charger and mounts",
      "Test infotainment/navigation system",
      "Ensure sufficient drinking water is packed",
    ],
  },
  {
    title: "Documents and Legal Requirements",
    items: [
      "Carry driver's license",
      "Bring vehicle registration documents",
      "Verify insurance validity",
      "Prepare roadside assistance information",
      "Check toll/payment devices if needed",
      "Carry spare vehicle key if available",
      "Save emergency contact numbers",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Start engine and monitor dashboard indicators",
      "Listen for unusual sounds during idle",
      "Test brakes at low speed",
      "Verify GPS/navigation route",
      "Check weather and road conditions",
      "Confirm fuel stations along route",
      "Double-check luggage security",
      "Ensure all passengers are ready",
      "Lock doors and secure valuables",
      "Begin trip with full attention and rest",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor dashboard warning lights",
      "Watch engine temperature gauge",
      "Check tire condition during stops",
      "Monitor fuel consumption",
      "Listen for unusual noises or vibrations",
      "Take regular driving breaks",
      "Recheck luggage security if needed",
      "Stay alert for changing weather conditions",
      "Inspect vehicle briefly during long stops",
      "Refuel before reaching critically low levels",
    ],
  },
] as const;

const OFF_ROAD_EXPEDITION_CHECKLIST = [
  {
    title: "Expedition Planning",
    items: [
      "Define expedition route and destinations",
      "Research terrain and trail conditions",
      "Check weather forecast for the entire route",
      "Identify fuel stations and supply points",
      "Share itinerary with emergency contacts",
      "Confirm permits or access permissions if required",
      "Plan emergency evacuation routes",
      "Estimate travel duration and daily distances",
      "Prepare offline maps and GPS routes",
      "Coordinate communication plan with group members",
    ],
  },
  {
    title: "Vehicle Inspection and Preparation",
    items: [
      "Perform full vehicle maintenance check",
      "Inspect engine oil and fluids",
      "Check coolant and brake fluid levels",
      "Inspect tires and adjust pressure for terrain",
      "Verify spare tire condition",
      "Test battery and charging system",
      "Inspect suspension and undercarriage",
      "Check recovery points and tow hooks",
      "Test lights and electrical systems",
      "Confirm fuel tank is full",
    ],
  },
  {
    title: "Recovery and Off-Road Equipment",
    items: [
      "Pack recovery straps and tow ropes",
      "Bring winch and accessories if available",
      "Carry traction boards",
      "Pack shovel and recovery tools",
      "Bring high-lift or off-road jack",
      "Carry tire repair kit",
      "Pack portable air compressor",
      "Bring spare fuses and tools",
      "Carry extra engine fluids",
      "Pack work gloves and protective gear",
    ],
  },
  {
    title: "Navigation and Communication",
    items: [
      "Bring GPS navigation device",
      "Download offline maps",
      "Carry paper maps and compass",
      "Test radios or communication devices",
      "Pack satellite communicator if needed",
      "Bring phone chargers and power banks",
      "Verify emergency contact numbers",
      "Prepare emergency signaling equipment",
      "Check mobile network coverage areas",
    ],
  },
  {
    title: "Camping and Survival Supplies",
    items: [
      "Pack tent and sleeping gear",
      "Bring weather-appropriate clothing",
      "Carry sufficient food supplies",
      "Pack drinking water and purification system",
      "Bring portable cooking equipment",
      "Pack fire-starting tools",
      "Carry first aid kit",
      "Prepare emergency blankets",
      "Bring insect repellent and sunscreen",
      "Pack trash bags for waste management",
    ],
  },
  {
    title: "Safety and Emergency Preparation",
    items: [
      "Review emergency procedures with group",
      "Prepare medical and allergy information",
      "Carry fire extinguisher",
      "Inspect first aid supplies",
      "Pack emergency shelter equipment",
      "Monitor weather alerts before departure",
      "Identify nearest emergency services",
      "Prepare backup transportation plan",
      "Verify insurance coverage for off-road travel",
      "Ensure all participants know the route plan",
    ],
  },
  {
    title: "Personal Gear and Clothing",
    items: [
      "Pack waterproof clothing",
      "Bring hiking or off-road boots",
      "Pack gloves and hats",
      "Carry sunglasses and eye protection",
      "Prepare extra clothing layers",
      "Bring personal hygiene supplies",
      "Pack flashlight or headlamp",
      "Carry personal medications",
      "Prepare waterproof bags for electronics",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all packed equipment",
      "Secure all cargo inside vehicle",
      "Charge all electronic devices",
      "Confirm fuel and water supplies",
      "Review weather and route updates",
      "Test communication equipment",
      "Inform emergency contact before leaving",
      "Verify tire pressure one final time",
      "Conduct final vehicle walkaround inspection",
      "Leave early to maximize daylight travel",
    ],
  },
  {
    title: "During the Expedition",
    items: [
      "Monitor fuel and water levels",
      "Check vehicle condition regularly",
      "Adjust tire pressure when needed",
      "Watch for terrain and weather hazards",
      "Maintain communication with group",
      "Take regular rest breaks",
      "Follow designated trails and regulations",
      "Avoid unnecessary risks or aggressive driving",
      "Secure campsite safely overnight",
      "Keep emergency equipment accessible",
    ],
  },
  {
    title: "After the Expedition",
    items: [
      "Inspect vehicle for damage",
      "Clean vehicle and recovery equipment",
      "Refill and recharge used supplies",
      "Dispose of waste properly",
      "Review expedition notes and route performance",
      "Back up GPS tracks and photos",
      "Repair or replace damaged gear",
      "Schedule post-trip vehicle maintenance",
      "Notify emergency contacts of safe return",
      "Store equipment properly for future use",
    ],
  },
] as const;

const FISHING_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose fishing destination",
      "Check fishing season and local regulations",
      "Verify fishing license requirements",
      "Review weather forecast",
      "Check water and tide conditions if applicable",
      "Plan transportation and route",
      "Inform someone about trip location and schedule",
      "Research target fish species",
      "Confirm boat reservations if needed",
      "Prepare emergency contact information",
    ],
  },
  {
    title: "Fishing Equipment",
    items: [
      "Pack fishing rods and reels",
      "Bring appropriate fishing line",
      "Pack hooks, sinkers, and swivels",
      "Prepare lures and bait",
      "Bring tackle box",
      "Pack fishing net",
      "Carry pliers and line cutters",
      "Bring rod holders if needed",
      "Pack extra fishing gear and spare parts",
      "Test equipment before departure",
    ],
  },
  {
    title: "Boat and Water Safety (if applicable)",
    items: [
      "Inspect boat condition",
      "Check fuel level",
      "Verify battery charge",
      "Test navigation lights",
      "Bring life jackets for all participants",
      "Pack emergency whistle or signaling device",
      "Carry anchor and rope",
      "Test communication devices",
      "Prepare emergency flotation equipment",
      "Check weather and water safety advisories",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket",
      "Wear non-slip footwear",
      "Pack hat and sunglasses",
      "Bring sunscreen",
      "Carry insect repellent",
      "Pack extra clothes and socks",
      "Bring gloves if necessary",
      "Prepare towels or wet wipes",
      "Carry waterproof bags for valuables",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Pack drinking water",
      "Bring snacks and meals",
      "Carry cooler with ice if needed",
      "Pack reusable utensils and cups",
      "Prepare coffee or hot drinks if desired",
      "Bring trash bags for waste disposal",
      "Store food securely from wildlife",
    ],
  },
  {
    title: "Navigation and Technology",
    items: [
      "Bring GPS or navigation device",
      "Download offline maps if necessary",
      "Charge phones and electronic devices",
      "Pack power bank or chargers",
      "Bring camera or binoculars",
      "Save emergency numbers and marina contacts",
      "Test fish finder or sonar equipment if used",
    ],
  },
  {
    title: "Safety and Emergency Supplies",
    items: [
      "Pack first aid kit",
      "Carry flashlight or headlamp",
      "Bring spare batteries",
      "Prepare emergency blanket",
      "Carry fire starter or waterproof matches",
      "Bring multitool or knife",
      "Pack personal medications",
      "Verify communication device functionality",
      "Review emergency procedures with group",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all fishing gear",
      "Confirm licenses and permits are packed",
      "Fuel vehicle or boat",
      "Review weather forecast again",
      "Verify bait and supplies are ready",
      "Secure equipment for transport",
      "Lock home and secure valuables",
      "Leave itinerary with trusted contact",
      "Ensure all participants are ready",
      "Depart with enough time before sunrise/tide if needed",
    ],
  },
  {
    title: "During the Fishing Trip",
    items: [
      "Follow local fishing regulations",
      "Monitor weather conditions",
      "Stay hydrated",
      "Keep hooks and sharp tools safely stored",
      "Maintain safe distance between anglers",
      "Handle fish safely and responsibly",
      "Respect wildlife and environment",
      "Monitor fuel and battery levels if boating",
      "Keep communication devices accessible",
      "Use sun protection regularly",
    ],
  },
  {
    title: "After the Trip",
    items: [
      "Clean fishing gear and equipment",
      "Dispose of waste properly",
      "Store fish safely if keeping catch",
      "Inspect rods, reels, and lines for damage",
      "Recharge batteries and electronics",
      "Wash and dry clothing and gear",
      "Log trip details or catches if desired",
      "Refill used supplies",
      "Notify contacts of safe return",
      "Store equipment properly for next trip",
    ],
  },
] as const;

const HUNTING_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose hunting location",
      "Verify hunting season dates",
      "Obtain required hunting licenses and permits",
      "Review local hunting laws and regulations",
      "Check weather forecast",
      "Plan transportation and route",
      "Inform someone about hunting location and schedule",
      "Research target game species and terrain",
      "Identify emergency contacts and nearest medical facilities",
      "Prepare backup plans for changing conditions",
    ],
  },
  {
    title: "Firearms and Hunting Equipment",
    items: [
      "Inspect firearm or bow condition",
      "Clean and lubricate firearm if needed",
      "Verify optics or scope alignment",
      "Pack appropriate ammunition or arrows",
      "Bring firearm or bow case",
      "Pack hunting knife and sharpening tool",
      "Carry binoculars or rangefinder",
      "Bring calls, decoys, or scent attractants if needed",
      "Pack hunting backpack",
      "Test all equipment before departure",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Wear blaze orange or required safety clothing",
      "Pack first aid kit",
      "Carry flashlight or headlamp",
      "Bring spare batteries",
      "Pack fire starter or waterproof matches",
      "Carry emergency whistle",
      "Bring navigation tools (GPS/map/compass)",
      "Pack emergency blanket or shelter",
      "Carry communication device or satellite messenger",
      "Prepare personal medications if needed",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Pack weather-appropriate hunting clothing",
      "Bring waterproof jacket and pants",
      "Wear insulated or durable boots",
      "Pack gloves and hat",
      "Bring extra socks and clothing layers",
      "Pack camouflage gear if appropriate",
      "Carry sunglasses and sunscreen",
      "Bring insect repellent",
      "Pack hygiene supplies and wet wipes",
      "Use waterproof bags for valuables and electronics",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Pack sufficient drinking water",
      "Bring snacks and meals",
      "Carry water purification system if needed",
      "Pack cooler with ice if transporting game",
      "Bring reusable utensils and containers",
      "Carry trash bags for waste disposal",
      "Store food securely from wildlife",
    ],
  },
  {
    title: "Navigation and Communication",
    items: [
      "Download offline maps",
      "Test GPS or navigation device",
      "Carry paper maps and compass",
      "Save emergency contact numbers",
      "Verify radio or communication equipment functionality",
      "Charge phones and power banks",
      "Confirm meeting points with hunting partners",
      "Review hunting area boundaries",
    ],
  },
  {
    title: "Camping and Field Supplies (if overnight trip)",
    items: [
      "Pack tent and sleeping gear",
      "Bring portable stove or cooking equipment",
      "Carry firewood or fuel if permitted",
      "Pack lantern or camp lighting",
      "Bring folding chair or field seating",
      "Prepare campsite safety equipment",
      "Carry rope or paracord",
      "Pack weather protection gear",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check licenses and permits",
      "Confirm firearm or bow is secured safely",
      "Check weather conditions again",
      "Fuel vehicle fully",
      "Secure all equipment for transport",
      "Inform emergency contact before leaving",
      "Verify all batteries are charged",
      "Review safety procedures with group",
      "Leave early with enough daylight time",
      "Confirm hunting area access permissions",
    ],
  },
  {
    title: "During the Hunting Trip",
    items: [
      "Follow all hunting laws and regulations",
      "Maintain firearm safety at all times",
      "Stay aware of surroundings and other hunters",
      "Monitor weather conditions",
      "Stay hydrated and rested",
      "Respect wildlife and environment",
      "Keep communication devices accessible",
      "Track location regularly",
      "Avoid unsafe shots or risky terrain",
      "Follow ethical hunting practices",
    ],
  },
  {
    title: "After the Trip",
    items: [
      "Unload and secure firearms safely",
      "Clean and inspect equipment",
      "Process and store harvested game properly",
      "Dispose of waste responsibly",
      "Recharge electronics and batteries",
      "Refill used supplies",
      "Wash and dry clothing and gear",
      "Record hunting observations if desired",
      "Notify contacts of safe return",
      "Store equipment securely for future trips",
    ],
  },
] as const;

const CARAVAN_CAMPER_VAN_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose travel destinations and route",
      "Plan overnight parking or camping locations",
      "Check campsite availability and reservations",
      "Review weather forecast for the trip",
      "Research road restrictions for large vehicles",
      "Estimate fuel and travel costs",
      "Identify fuel stations and service areas",
      "Share itinerary with family or friends",
      "Prepare emergency contact information",
      "Download offline maps and navigation routes",
    ],
  },
  {
    title: "Vehicle Inspection",
    items: [
      "Check engine oil and fluid levels",
      "Inspect coolant and brake fluid",
      "Check tire pressure and tread condition",
      "Verify spare tire condition",
      "Test headlights, brake lights, and indicators",
      "Inspect windshield wipers and washer fluid",
      "Check battery condition",
      "Test brakes and steering",
      "Verify mirrors and cameras work properly",
      "Confirm fuel tank is full",
    ],
  },
  {
    title: "Caravan / Camper Systems",
    items: [
      "Test electrical system and battery charge",
      "Check solar panels if installed",
      "Verify water tank levels",
      "Inspect plumbing and water pump",
      "Test gas system and connections",
      "Check refrigerator and kitchen appliances",
      "Verify heating and air conditioning systems",
      "Inspect toilet and waste tank systems",
      "Empty gray and black water tanks if needed",
      "Test interior lighting and power outlets",
    ],
  },
  {
    title: "Camping and Outdoor Equipment",
    items: [
      "Pack camping chairs and table",
      "Bring outdoor cooking equipment",
      "Pack leveling blocks or ramps",
      "Carry extension cords and adapters",
      "Bring water hose and connectors",
      "Pack awning and accessories",
      "Bring outdoor lighting",
      "Carry basic repair tools",
      "Pack fire extinguisher",
      "Bring trash bags and cleaning supplies",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Stock drinking water",
      "Prepare meals and snacks",
      "Pack cooking utensils and cookware",
      "Bring reusable plates and cups",
      "Store food securely",
      "Pack cooler or refrigeration items",
      "Bring coffee/tea supplies",
      "Carry extra bottled water for emergencies",
      "Prepare dishwashing supplies",
    ],
  },
  {
    title: "Clothing and Personal Items",
    items: [
      "Pack weather-appropriate clothing",
      "Bring comfortable shoes",
      "Pack towels and toiletries",
      "Bring rain gear",
      "Pack hats and sunglasses",
      "Carry sunscreen and insect repellent",
      "Bring bedding and blankets",
      "Pack personal medications",
      "Prepare laundry supplies if needed",
    ],
  },
  {
    title: "Safety and Emergency Supplies",
    items: [
      "Pack first aid kit",
      "Carry flashlight or headlamp",
      "Bring spare batteries and power banks",
      "Pack emergency roadside kit",
      "Carry jumper cables",
      "Bring warning triangle and reflective vest",
      "Prepare emergency blankets",
      "Save roadside assistance contacts",
      "Carry spare fuses and bulbs",
      "Bring navigation backup tools (map/compass)",
    ],
  },
  {
    title: "Technology and Connectivity",
    items: [
      "Charge phones and electronic devices",
      "Bring charging cables and adapters",
      "Test GPS/navigation system",
      "Download entertainment content if needed",
      "Verify internet/mobile hotspot access",
      "Pack camera or travel accessories",
      "Prepare backup storage for photos/videos",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all packed equipment",
      "Secure loose items inside camper",
      "Lock cabinets and storage compartments",
      "Test all vehicle systems one final time",
      "Check weather and traffic conditions",
      "Confirm campsite reservations",
      "Secure doors and windows",
      "Lock home and secure valuables",
      "Inform emergency contact before leaving",
      "Start trip with sufficient daylight if possible",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor fuel and water levels",
      "Check tire condition regularly",
      "Empty waste tanks when necessary",
      "Refill fresh water supply as needed",
      "Monitor weather conditions",
      "Follow campsite and parking regulations",
      "Secure outdoor equipment overnight",
      "Keep emergency supplies accessible",
      "Stay hydrated and rested",
      "Inspect vehicle during long stops",
    ],
  },
  {
    title: "After the Trip",
    items: [
      "Empty and clean waste tanks",
      "Refill or clean water systems",
      "Clean interior and exterior of camper",
      "Inspect vehicle for damage or maintenance needs",
      "Recharge batteries and electronics",
      "Wash and store camping equipment",
      "Dispose of trash properly",
      "Restock supplies for future trips",
      "Review trip notes and expenses",
      "Store caravan/camper securely",
    ],
  },
] as const;

const BOAT_YACHT_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose destination and route",
      "Review nautical charts and navigation routes",
      "Check weather and sea conditions",
      "Verify marina reservations if needed",
      "Estimate fuel and travel duration",
      "Inform someone about trip itinerary",
      "Review local boating regulations",
      "Confirm passenger list and capacity limits",
      "Prepare emergency contact information",
      "Plan backup route or safe harbor options",
    ],
  },
  {
    title: "Vessel Inspection",
    items: [
      "Inspect hull for visible damage",
      "Check engine oil and fluid levels",
      "Verify fuel level and fuel system condition",
      "Test steering and throttle controls",
      "Inspect battery charge and electrical systems",
      "Check navigation lights",
      "Verify anchor and anchor line condition",
      "Test bilge pump functionality",
      "Inspect propeller condition",
      "Ensure all hatches and compartments are secure",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Verify life jackets for all passengers",
      "Inspect fire extinguishers",
      "Check emergency flares and signaling devices",
      "Prepare first aid kit",
      "Test VHF radio or communication devices",
      "Carry emergency whistle or horn",
      "Verify emergency lighting and flashlights",
      "Prepare throwable flotation device",
      "Check emergency repair kit",
      "Review emergency procedures with passengers",
    ],
  },
  {
    title: "Navigation and Communication",
    items: [
      "Bring GPS/navigation system",
      "Carry updated nautical charts",
      "Pack compass and backup navigation tools",
      "Test marine radio functionality",
      "Save emergency marina/coast guard contacts",
      "Charge phones and communication devices",
      "Prepare power banks or spare batteries",
      "Download offline navigation apps if needed",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Pack sufficient drinking water",
      "Prepare meals and snacks",
      "Bring cooler with ice if needed",
      "Pack reusable plates and utensils",
      "Store food securely",
      "Bring seasickness medication if needed",
      "Pack coffee, tea, or beverages",
      "Carry extra emergency food supplies",
      "Bring trash bags for waste disposal",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jackets",
      "Wear non-slip footwear",
      "Pack hats and sunglasses",
      "Bring sunscreen and lip balm",
      "Carry towels and swimwear",
      "Pack extra dry clothing",
      "Bring personal medications",
      "Prepare waterproof bags for valuables",
      "Carry blankets or warm layers if needed",
    ],
  },
  {
    title: "Water Activities and Recreation",
    items: [
      "Pack snorkeling or diving equipment if needed",
      "Bring fishing gear if applicable",
      "Prepare water sports equipment",
      "Pack life vests for water activities",
      "Bring cameras or binoculars",
      "Prepare music or entertainment systems",
      "Verify swimming ladder functionality",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check weather and sea forecasts",
      "Confirm fuel and water supplies",
      "Test engine startup and controls",
      "Verify all passengers are onboard and briefed",
      "Secure loose equipment and luggage",
      "Confirm marina departure procedures",
      "Lock vehicle or dock storage if needed",
      "Review route and navigation plan",
      "Ensure all electronics are charged",
      "Conduct final safety inspection",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor weather and sea conditions",
      "Check fuel levels regularly",
      "Maintain communication availability",
      "Ensure passengers wear safety gear when needed",
      "Monitor navigation and route progress",
      "Keep deck areas organized and safe",
      "Stay alert for nearby vessels and hazards",
      "Follow speed and navigation regulations",
      "Stay hydrated and protected from sun exposure",
      "Monitor engine and system performance",
    ],
  },
  {
    title: "After the Trip",
    items: [
      "Dock and secure vessel properly",
      "Shut down engine and electrical systems",
      "Inspect vessel for damage",
      "Refill fuel if necessary",
      "Dispose of trash responsibly",
      "Clean deck and interior areas",
      "Rinse saltwater from equipment",
      "Recharge batteries and electronics",
      "Store safety equipment properly",
      "Log trip details and maintenance notes",
    ],
  },
] as const;

const EMERGENCY_DISASTER_PREPAREDNESS_CHECKLIST = [
  {
    title: "Emergency Planning",
    items: [
      "Identify possible local disasters and risks",
      "Create a family emergency plan",
      "Assign emergency responsibilities to household members",
      "Prepare emergency contact list",
      "Identify evacuation routes and shelters",
      "Establish meeting points for family members",
      "Save important emergency phone numbers",
      "Plan communication methods if phones fail",
      "Review emergency procedures regularly",
      "Practice emergency drills with household members",
    ],
  },
  {
    title: "Emergency Supply Kit",
    items: [
      "Store drinking water supply",
      "Prepare non-perishable food supply",
      "Pack manual can opener",
      "Include first aid kit",
      "Store essential medications",
      "Pack flashlights and extra batteries",
      "Include portable phone chargers/power banks",
      "Prepare emergency blankets",
      "Pack hygiene and sanitation supplies",
      "Include multi-tool or utility knife",
    ],
  },
  {
    title: "Documents and Finances",
    items: [
      "Store copies of important documents",
      "Prepare waterproof document storage",
      "Save emergency cash",
      "Back up important digital files",
      "Keep insurance information accessible",
      "Store medical records if needed",
      "Prepare list of emergency contacts",
      "Save property ownership/rental documents",
      "Keep spare keys accessible",
      "Verify emergency banking access",
    ],
  },
  {
    title: "Home Safety Preparation",
    items: [
      "Test smoke detectors",
      "Check carbon monoxide detectors",
      "Inspect fire extinguishers",
      "Learn how to shut off utilities",
      "Secure heavy furniture and appliances",
      "Inspect windows and doors for safety",
      "Prepare emergency lighting",
      "Store hazardous materials safely",
      "Ensure emergency exits are accessible",
      "Trim trees or branches near home if necessary",
    ],
  },
  {
    title: "Communication and Technology",
    items: [
      "Charge all electronic devices",
      "Prepare battery-powered or hand-crank radio",
      "Download emergency alert apps",
      "Save offline maps",
      "Prepare backup communication devices",
      "Test emergency notification systems",
      "Store extra charging cables and adapters",
      "Prepare solar chargers if available",
      "Keep emergency contact list printed",
    ],
  },
  {
    title: "Food and Water Preparation",
    items: [
      "Rotate stored food regularly",
      "Check expiration dates on supplies",
      "Store water purification tablets or filters",
      "Prepare emergency cooking equipment",
      "Store pet food if applicable",
      "Keep reusable water containers ready",
      "Prepare disposable utensils and plates",
      "Store food in waterproof containers",
    ],
  },
  {
    title: "Medical and Personal Needs",
    items: [
      "Refill prescription medications",
      "Pack personal hygiene supplies",
      "Prepare spare glasses or contact lenses",
      "Store infant or elderly care supplies if needed",
      "Include masks and gloves",
      "Pack personal comfort items",
      "Prepare mobility aids if necessary",
      "Keep vaccination records accessible",
    ],
  },
  {
    title: "Vehicle Emergency Preparation",
    items: [
      "Keep vehicle fuel tank at least half full",
      "Prepare vehicle emergency kit",
      "Pack jumper cables and flashlight",
      "Carry blankets and extra clothing",
      "Store bottled water and snacks in vehicle",
      "Verify spare tire and tools",
      "Prepare paper maps in vehicle",
      "Save roadside assistance information",
      "Keep phone charger in vehicle",
    ],
  },
  {
    title: "Evacuation Readiness",
    items: [
      "Prepare emergency go-bags",
      "Pack clothing and essential supplies",
      "Label emergency bags clearly",
      "Prepare pet evacuation supplies",
      "Identify safe evacuation destinations",
      "Keep shoes and flashlights accessible",
      "Review evacuation routes regularly",
      "Store emergency supplies near exits",
      "Ensure transportation is available",
    ],
  },
  {
    title: "During an Emergency",
    items: [
      "Follow official instructions and alerts",
      "Stay calm and communicate clearly",
      "Use emergency supplies responsibly",
      "Monitor news and emergency updates",
      "Avoid unnecessary travel",
      "Check on vulnerable family members or neighbors",
      "Shut off utilities if instructed",
      "Keep emergency contacts informed",
      "Avoid hazardous areas",
    ],
  },
  {
    title: "After the Emergency",
    items: [
      "Check for injuries and provide first aid",
      "Inspect home for damage carefully",
      "Avoid unsafe structures or utilities",
      "Document damage with photos/videos",
      "Contact insurance providers if needed",
      "Dispose of contaminated food or water",
      "Restock emergency supplies",
      "Recharge devices and equipment",
      "Review lessons learned from the emergency",
      "Update emergency plans if necessary",
    ],
  },
] as const;

const FIRST_DAY_OF_SCHOOL_CHECKLIST = [
  {
    title: "School Preparation",
    items: [
      "Confirm school start date and schedule",
      "Review class timetable",
      "Check school policies and requirements",
      "Verify classroom or teacher assignments",
      "Prepare school ID or registration documents",
      "Review transportation arrangements",
      "Confirm lunch or meal plan setup",
      "Check school supply list",
      "Save important school contact information",
      "Review emergency procedures and pickup plans",
    ],
  },
  {
    title: "School Supplies",
    items: [
      "Pack backpack",
      "Prepare notebooks and folders",
      "Pack pens, pencils, and erasers",
      "Bring calculator if required",
      "Pack textbooks or reading materials",
      "Prepare laptop/tablet if needed",
      "Charge electronic devices",
      "Pack chargers and headphones",
      "Bring water bottle",
      "Label personal belongings with name",
    ],
  },
  {
    title: "Clothing and Personal Items",
    items: [
      "Prepare school uniform or appropriate clothing",
      "Check shoes and socks",
      "Pack extra clothing if necessary",
      "Prepare jacket or weather-appropriate outerwear",
      "Pack personal hygiene items",
      "Bring tissues or hand sanitizer",
      "Prepare glasses or contact lenses if needed",
      "Pack sports clothes if applicable",
    ],
  },
  {
    title: "Health and Safety",
    items: [
      "Prepare medications if required",
      "Update vaccination or medical records if necessary",
      "Pack allergy or emergency medical items",
      "Review school health policies",
      "Ensure emergency contact information is current",
      "Confirm pickup/drop-off instructions",
      "Prepare face masks if required",
    ],
  },
  {
    title: "Transportation Preparation",
    items: [
      "Confirm school bus schedule if applicable",
      "Review walking or driving route",
      "Prepare transportation card or pass",
      "Test estimated travel time",
      "Arrange backup transportation if needed",
      "Review safe crossing and travel rules",
      "Confirm parking/drop-off procedures",
    ],
  },
  {
    title: "Academic Preparation",
    items: [
      "Review previous school materials if needed",
      "Organize study space at home",
      "Prepare planner or calendar",
      "Set goals for the school year",
      "Review school apps or online platforms",
      "Check email or communication systems",
      "Prepare questions for teachers if necessary",
    ],
  },
  {
    title: "Social and Emotional Preparation",
    items: [
      "Talk about expectations for the first day",
      "Discuss classroom and school rules",
      "Prepare introductions for meeting classmates",
      "Address any school-related concerns or anxiety",
      "Encourage positive attitude and confidence",
      "Review after-school schedule and activities",
      "Plan healthy sleep routine before school starts",
    ],
  },
  {
    title: "The Night Before",
    items: [
      "Pack backpack completely",
      "Lay out clothes and shoes",
      "Charge devices and electronics",
      "Prepare lunch or snacks if needed",
      "Set alarm clock",
      "Double-check school documents and supplies",
      "Confirm transportation arrangements",
      "Get enough sleep",
      "Review morning schedule",
      "Relax and prepare mentally for the first day",
    ],
  },
  {
    title: "Morning of the First Day",
    items: [
      "Wake up early",
      "Eat a healthy breakfast",
      "Get dressed and ready on time",
      "Double-check backpack contents",
      "Bring water bottle and lunch",
      "Leave home with enough travel time",
      "Stay calm and positive",
      "Verify transportation timing",
      "Say goodbye to family or guardians",
      "Arrive at school safely and on time",
    ],
  },
  {
    title: "After School",
    items: [
      "Review first-day experiences",
      "Organize homework or school materials",
      "Recharge devices if needed",
      "Prepare for the next school day",
      "Discuss any concerns or questions",
      "Confirm schedule and assignments",
      "Get adequate rest for the following day",
    ],
  },
] as const;

const EXAM_OR_CERTIFICATION_CHECKLIST = [
  {
    title: "Exam Planning",
    items: [
      "Confirm exam or certification date",
      "Review exam format and structure",
      "Check registration and payment status",
      "Verify exam location or online platform details",
      "Review exam rules and requirements",
      "Identify required passing score or objectives",
      "Create study timeline and schedule",
      "Set realistic study goals",
      "Prepare backup plan for emergencies",
      "Save important exam contact information",
    ],
  },
  {
    title: "Study Materials Preparation",
    items: [
      "Gather textbooks and study guides",
      "Organize notes and learning materials",
      "Download official exam objectives or syllabus",
      "Prepare flashcards or summaries",
      "Collect practice tests and sample questions",
      "Organize digital files and bookmarks",
      "Prepare notebook for revision notes",
      "Ensure access to online learning platforms",
      "Update software/tools required for preparation",
      "Create a dedicated study space",
    ],
  },
  {
    title: "Study Routine and Practice",
    items: [
      "Schedule regular study sessions",
      "Focus on weak subjects or topics",
      "Practice time management during mock exams",
      "Complete practice questions regularly",
      "Review incorrect answers carefully",
      "Take notes on difficult concepts",
      "Join study group or discussion forums if useful",
      "Track study progress",
      "Schedule review sessions before the exam",
      "Avoid procrastination and distractions",
    ],
  },
  {
    title: "Technology and Equipment",
    items: [
      "Charge laptop/tablet if studying digitally",
      "Verify internet connection for online exams",
      "Test webcam and microphone if required",
      "Install required exam software or browser",
      "Back up important study materials",
      "Prepare headphones if needed",
      "Keep chargers and cables accessible",
      "Disable unnecessary notifications during study sessions",
      "Verify calculator or permitted tools work properly",
    ],
  },
  {
    title: "Health and Wellness",
    items: [
      "Maintain regular sleep schedule",
      "Stay hydrated",
      "Eat balanced meals",
      "Take regular study breaks",
      "Exercise or stretch regularly",
      "Manage stress and anxiety",
      "Avoid excessive caffeine or energy drinks",
      "Practice relaxation or breathing exercises",
      "Prepare personal medications if needed",
      "Avoid last-minute cramming before sleeping",
    ],
  },
  {
    title: "Exam Documents and Requirements",
    items: [
      "Prepare identification documents",
      "Print or save exam confirmation details",
      "Verify login credentials for online exams",
      "Bring required permits or authorization documents",
      "Prepare approved calculator or supplies",
      "Review prohibited items list",
      "Check transportation arrangements to exam center",
      "Prepare emergency contact information",
    ],
  },
  {
    title: "The Day Before the Exam",
    items: [
      "Review key concepts and summaries",
      "Avoid studying too late at night",
      "Pack all required materials",
      "Charge all devices if needed",
      "Confirm exam time and location again",
      "Prepare comfortable clothing",
      "Set alarm clock",
      "Organize snacks and water if allowed",
      "Relax and get enough sleep",
      "Visualize successful performance",
    ],
  },
  {
    title: "Exam Day Preparation",
    items: [
      "Wake up early",
      "Eat a healthy meal",
      "Dress comfortably and appropriately",
      "Arrive early or log in ahead of time",
      "Bring all required documents and supplies",
      "Stay calm and focused",
      "Avoid discussing stressful topics with others",
      "Read instructions carefully before starting",
      "Manage time effectively during the exam",
      "Review answers if time allows",
    ],
  },
  {
    title: "During the Exam",
    items: [
      "Read each question carefully",
      "Answer easier questions first if needed",
      "Monitor remaining time regularly",
      "Stay calm under pressure",
      "Avoid rushing through questions",
      "Use elimination methods for difficult questions",
      "Double-check calculations and answers",
      "Follow exam rules strictly",
      "Ask proctor for clarification if permitted",
      "Submit exam only after final review",
    ],
  },
  {
    title: "After the Exam",
    items: [
      "Confirm successful submission or completion",
      "Record important feedback or observations",
      "Relax and recover after the exam",
      "Save exam-related documents if needed",
      "Review performance for future improvement",
      "Track result release dates",
      "Plan next certification or study goals",
      "Celebrate completion of the exam process",
    ],
  },
] as const;

const ONBOARDING_NEW_EMPLOYEE_CHECKLIST = [
  {
    title: "Pre-Onboarding Preparation",
    items: [
      "Confirm employee start date",
      "Prepare employment contract and documents",
      "Verify signed agreements and policies",
      "Create employee profile in HR system",
      "Assign employee ID number",
      "Prepare workstation and office access",
      "Order required equipment and supplies",
      "Create company email account",
      "Set up communication and collaboration tools",
      "Inform team members about new hire arrival",
    ],
  },
  {
    title: "IT and System Setup",
    items: [
      "Prepare laptop or desktop computer",
      "Install required software and applications",
      "Configure email and calendar access",
      "Set up VPN and remote access if needed",
      "Create user accounts and passwords",
      "Configure security permissions and access levels",
      "Test internet and network connectivity",
      "Prepare phone or communication devices if applicable",
      "Verify printer and shared drive access",
      "Enable multi-factor authentication if required",
    ],
  },
  {
    title: "Workspace Preparation",
    items: [
      "Assign desk or office space",
      "Prepare ergonomic workstation setup",
      "Organize office supplies",
      "Ensure access card or keys are ready",
      "Prepare parking access if needed",
      "Verify meeting room booking access",
      "Prepare welcome package or materials",
      "Ensure workspace cleanliness and readiness",
    ],
  },
  {
    title: "HR and Administrative Tasks",
    items: [
      "Collect identification and tax documents",
      "Complete payroll setup",
      "Enroll employee in benefits programs",
      "Review company handbook and policies",
      "Explain attendance and leave procedures",
      "Confirm emergency contact information",
      "Review code of conduct and compliance policies",
      "Provide organizational chart and contacts",
      "Explain expense and reimbursement procedures",
      "Schedule required HR orientation sessions",
    ],
  },
  {
    title: "Team Introduction and Communication",
    items: [
      "Introduce employee to team members",
      "Assign onboarding buddy or mentor",
      "Schedule welcome meeting with manager",
      "Share company communication channels",
      "Explain reporting structure",
      "Introduce key stakeholders and departments",
      "Add employee to internal groups and mailing lists",
      "Schedule introductory meetings with collaborators",
      "Review team goals and responsibilities",
    ],
  },
  {
    title: "Training and Learning",
    items: [
      "Provide onboarding training schedule",
      "Share required learning materials",
      "Assign mandatory compliance or security training",
      "Review company tools and workflows",
      "Explain job responsibilities and expectations",
      "Provide access to internal documentation",
      "Schedule product/service training if needed",
      "Define short-term onboarding goals",
      "Explain performance evaluation process",
      "Plan regular check-ins during onboarding period",
    ],
  },
  {
    title: "Security and Compliance",
    items: [
      "Review cybersecurity policies",
      "Explain password and device security requirements",
      "Provide data privacy and confidentiality training",
      "Review workplace safety procedures",
      "Explain incident reporting process",
      "Ensure NDA or confidentiality agreements are signed",
      "Verify access permissions follow company policy",
      "Test emergency communication procedures",
    ],
  },
  {
    title: "First Day Preparation",
    items: [
      "Confirm employee arrival time",
      "Prepare welcome message or presentation",
      "Ensure all systems and accounts are active",
      "Verify equipment is fully functional",
      "Organize orientation schedule",
      "Prepare building access instructions",
      "Arrange lunch or welcome activity if applicable",
      "Ensure manager is available for onboarding",
      "Double-check all required documents are ready",
      "Create positive first-day experience",
    ],
  },
  {
    title: "During the First Week",
    items: [
      "Conduct daily or regular check-ins",
      "Review onboarding progress",
      "Answer employee questions promptly",
      "Provide feedback and guidance",
      "Monitor access to required systems",
      "Encourage team interaction and collaboration",
      "Clarify tasks and expectations",
      "Verify training completion status",
      "Address technical or administrative issues quickly",
      "Evaluate initial employee experience",
    ],
  },
  {
    title: "After Initial Onboarding",
    items: [
      "Review onboarding goals and achievements",
      "Conduct onboarding feedback session",
      "Update training or development plans",
      "Confirm long-term responsibilities and projects",
      "Evaluate system and access needs",
      "Continue mentorship or coaching support",
      "Document onboarding completion",
      "Plan future performance reviews",
      "Encourage ongoing learning and development",
      "Celebrate successful onboarding completion",
    ],
  },
] as const;

const OFFBOARDING_CHECKLIST = [
  {
    title: "Offboarding Planning",
    items: [
      "Confirm employee’s last working day",
      "Review resignation or termination details",
      "Notify HR, management, and relevant departments",
      "Assign offboarding responsibilities",
      "Prepare offboarding timeline",
      "Schedule exit interview",
      "Review employment contract and obligations",
      "Confirm final payroll and compensation details",
      "Review legal or compliance requirements",
      "Prepare communication plan for team and stakeholders",
    ],
  },
  {
    title: "HR and Administrative Tasks",
    items: [
      "Collect signed resignation documents if applicable",
      "Process termination in HR system",
      "Prepare final paycheck and benefits information",
      "Review unused vacation or leave balances",
      "Explain benefits termination or continuation options",
      "Update employee records",
      "Revoke access to HR systems",
      "Confirm forwarding address and contact details",
      "Provide tax and employment documentation",
      "Prepare employment verification process if needed",
    ],
  },
  {
    title: "IT and Security Access",
    items: [
      "Disable company email account",
      "Revoke access to internal systems and software",
      "Disable VPN and remote access",
      "Remove access to shared drives and cloud services",
      "Disable communication tool accounts",
      "Reset shared passwords if necessary",
      "Collect company devices and equipment",
      "Verify return of access cards and keys",
      "Remove mobile device management access",
      "Archive or transfer important work files and emails",
    ],
  },
  {
    title: "Equipment and Asset Return",
    items: [
      "Collect laptop or desktop computer",
      "Retrieve monitors, keyboards, and accessories",
      "Collect company phone or SIM card",
      "Retrieve security badges or ID cards",
      "Collect office keys and parking passes",
      "Verify return of documents or manuals",
      "Inspect returned equipment for damage",
      "Update asset inventory records",
      "Confirm return of uniforms or company property",
      "Secure confidential materials and files",
    ],
  },
  {
    title: "Knowledge Transfer and Handover",
    items: [
      "Reassign ongoing projects and responsibilities",
      "Document current tasks and workflows",
      "Transfer important files and documentation",
      "Share passwords or account access where appropriate",
      "Introduce replacement or backup personnel if applicable",
      "Schedule handover meetings with team members",
      "Update project status reports",
      "Identify unresolved issues or pending tasks",
      "Ensure client or vendor transition communication is completed",
    ],
  },
  {
    title: "Communication and Team Management",
    items: [
      "Inform team members about departure",
      "Notify clients or external partners if necessary",
      "Update organizational charts and contact lists",
      "Remove employee from mailing lists and groups",
      "Prepare farewell or appreciation message if appropriate",
      "Communicate interim role coverage plans",
      "Update website or company directory if needed",
    ],
  },
  {
    title: "Compliance and Legal Review",
    items: [
      "Review confidentiality and NDA obligations",
      "Confirm return or deletion of sensitive data",
      "Verify compliance with company policies",
      "Conduct security and access audit",
      "Ensure legal documentation is completed",
      "Review post-employment restrictions if applicable",
      "Document any incidents or unresolved concerns",
    ],
  },
  {
    title: "Exit Interview and Feedback",
    items: [
      "Conduct exit interview",
      "Discuss employee feedback and suggestions",
      "Review reasons for departure",
      "Identify workplace improvement opportunities",
      "Document key feedback and observations",
      "Clarify future contact procedures if needed",
      "Thank employee for contributions",
    ],
  },
  {
    title: "Final Day Procedures",
    items: [
      "Verify all company property is returned",
      "Confirm all system access is disabled",
      "Complete workspace inspection",
      "Remove personal belongings from workspace",
      "Process final approvals and signatures",
      "Provide final HR or payroll information",
      "Escort visitor/vendor accounts closure if needed",
      "Confirm completion of offboarding tasks",
      "Say farewell to team members professionally",
    ],
  },
  {
    title: "After Offboarding",
    items: [
      "Archive employee records securely",
      "Review security logs and access history",
      "Update staffing and workload plans",
      "Analyze exit interview feedback",
      "Monitor transition of responsibilities",
      "Close remaining administrative tasks",
      "Review lessons learned from offboarding process",
      "Maintain compliance documentation",
      "Evaluate improvements to offboarding procedures",
      "Finalize replacement hiring plans if needed",
    ],
  },
] as const;

const RELEASE_DEPLOYMENT_CHECKLIST = [
  {
    title: "Release Planning",
    items: [
      "Define release scope and objectives",
      "Confirm release version number",
      "Review feature completion status",
      "Verify bug fixes included in release",
      "Confirm release approval from stakeholders",
      "Prepare deployment timeline",
      "Assign deployment responsibilities",
      "Schedule maintenance window if required",
      "Prepare rollback and recovery plan",
      "Notify affected teams and users about release",
    ],
  },
  {
    title: "Code and Repository Preparation",
    items: [
      "Merge approved code changes into release branch",
      "Verify code review completion",
      "Ensure no unresolved critical issues remain",
      "Confirm branch protection rules are satisfied",
      "Remove debug code and temporary logs",
      "Update version numbers and changelog",
      "Verify environment configuration files",
      "Confirm secrets and environment variables are configured securely",
      "Tag release version in Git repository",
      "Push all final changes to remote repository",
    ],
  },
  {
    title: "Testing and Quality Assurance",
    items: [
      "Run automated unit tests",
      "Run integration tests",
      "Execute end-to-end tests",
      "Verify CI/CD pipeline passes successfully",
      "Perform manual smoke testing",
      "Validate bug fixes",
      "Test critical business workflows",
      "Verify API functionality",
      "Check authentication and authorization flows",
      "Confirm responsive UI behavior across devices",
    ],
  },
  {
    title: "Database and Backend Preparation",
    items: [
      "Review database migration scripts",
      "Backup production database",
      "Verify database migration compatibility",
      "Test migrations in staging environment",
      "Confirm database seed scripts if required",
      "Check API endpoint availability",
      "Verify server-side logs and monitoring",
      "Validate caching configuration",
      "Confirm background jobs and scheduled tasks functionality",
      "Test scalability and performance if applicable",
    ],
  },
  {
    title: "Infrastructure and Environment Checks",
    items: [
      "Verify production environment availability",
      "Confirm hosting platform status",
      "Check SSL certificates and domain configuration",
      "Validate CDN and caching settings",
      "Ensure monitoring and alerting systems are active",
      "Verify backup systems are operational",
      "Confirm load balancer and scaling settings",
      "Review firewall and security rules",
      "Verify storage systems and object storage access",
      "Ensure deployment credentials are available",
    ],
  },
  {
    title: "Frontend and Client Application Checks",
    items: [
      "Build production frontend successfully",
      "Verify environment variables for frontend",
      "Test production API integration",
      "Validate routing and navigation",
      "Check asset optimization and loading",
      "Verify accessibility and UI consistency",
      "Test mobile responsiveness",
      "Validate error handling and fallback screens",
      "Ensure analytics/tracking integrations work correctly",
      "Confirm browser compatibility",
    ],
  },
  {
    title: "Mobile App Deployment Checks (if applicable)",
    items: [
      "Verify mobile API connectivity",
      "Test authentication on mobile app",
      "Validate critical mobile workflows",
      "Confirm environment configuration for mobile build",
      "Test push notifications if applicable",
      "Verify Expo or app store build settings",
      "Confirm mobile app versioning",
      "Test app installation/update process",
      "Verify offline handling if applicable",
      "Build production APK/IPA if required",
    ],
  },
  {
    title: "Security and Compliance",
    items: [
      "Verify sensitive data is protected",
      "Confirm HTTPS enforcement",
      "Check authentication token expiration and security",
      "Review access permissions and roles",
      "Validate input validation and sanitization",
      "Confirm dependency vulnerability scans",
      "Verify rate limiting and API protection",
      "Ensure logs do not expose sensitive information",
      "Review compliance requirements if applicable",
      "Confirm backup recovery procedures are tested",
    ],
  },
  {
    title: "Deployment Execution",
    items: [
      "Confirm deployment start approval",
      "Deploy backend services",
      "Run database migrations",
      "Deploy frontend application",
      "Deploy mobile/web exports if applicable",
      "Verify deployment logs for errors",
      "Restart services if necessary",
      "Clear or refresh caches if needed",
      "Validate production environment health",
      "Monitor deployment progress in real time",
    ],
  },
  {
    title: "Post-Deployment Verification",
    items: [
      "Perform smoke tests in production",
      "Verify login and authentication",
      "Test critical user workflows",
      "Confirm database connectivity",
      "Verify API responses and integrations",
      "Monitor application logs and errors",
      "Check performance metrics",
      "Verify monitoring and alerts are functioning",
      "Confirm third-party integrations work correctly",
      "Ensure no critical regressions exist",
    ],
  },
  {
    title: "Rollback Readiness",
    items: [
      "Verify rollback procedures are documented",
      "Ensure previous stable version is available",
      "Confirm database rollback plan if necessary",
      "Validate backup integrity",
      "Identify rollback decision owners",
      "Monitor for critical production issues",
      "Prepare communication templates for incidents",
      "Ensure team availability during release window",
    ],
  },
  {
    title: "Release Communication and Documentation",
    items: [
      "Announce successful deployment to stakeholders",
      "Publish release notes or changelog",
      "Update internal documentation",
      "Notify support and operations teams",
      "Inform users about new features or downtime",
      "Archive deployment logs and reports",
      "Record deployment issues and lessons learned",
      "Update project management or tracking tools",
      "Schedule post-release review meeting",
      "Plan follow-up monitoring and maintenance activities",
    ],
  },
] as const;

const QA_SOFTWARE_TESTING_CHECKLIST = [
  {
    title: "Test Planning",
    items: [
      "Define testing scope and objectives",
      "Review project requirements and specifications",
      "Identify critical business workflows",
      "Prepare test strategy and test plan",
      "Define testing environment requirements",
      "Assign testing responsibilities",
      "Prepare testing timeline and milestones",
      "Identify supported devices, browsers, and platforms",
      "Define acceptance criteria",
      "Prepare risk assessment and mitigation plan",
    ],
  },
  {
    title: "Test Environment Setup",
    items: [
      "Configure testing environment",
      "Verify access to staging/test servers",
      "Prepare test accounts and permissions",
      "Set up test databases and seed data",
      "Configure API endpoints and environment variables",
      "Install required testing tools and software",
      "Verify logging and monitoring tools",
      "Ensure stable internet/network access",
      "Confirm third-party integrations are available for testing",
      "Validate deployment of latest build",
    ],
  },
  {
    title: "Functional Testing",
    items: [
      "Test user registration and login",
      "Verify authentication and authorization",
      "Test CRUD operations for core entities",
      "Validate form inputs and error handling",
      "Test navigation and routing",
      "Verify search, filtering, and sorting features",
      "Test file uploads/downloads if applicable",
      "Validate notifications and alerts",
      "Verify role-based access restrictions",
      "Test logout and session expiration",
    ],
  },
  {
    title: "UI and UX Testing",
    items: [
      "Verify responsive design on different screen sizes",
      "Test layout consistency across pages",
      "Check fonts, colors, and visual elements",
      "Validate icons, buttons, and interactions",
      "Test loading indicators and animations",
      "Verify accessibility and keyboard navigation",
      "Ensure error messages are user-friendly",
      "Check modal dialogs and popups",
      "Validate mobile and tablet usability",
      "Confirm no broken links or UI overlaps",
    ],
  },
  {
    title: "API Testing",
    items: [
      "Test all API endpoints",
      "Validate request and response formats",
      "Verify authentication tokens and headers",
      "Test invalid and missing input handling",
      "Confirm proper HTTP status codes",
      "Validate pagination and filtering",
      "Test API performance under load",
      "Verify rate limiting if implemented",
      "Check API error responses",
      "Confirm API documentation accuracy",
    ],
  },
  {
    title: "Database Testing",
    items: [
      "Verify database schema integrity",
      "Test database migrations",
      "Validate foreign key relationships",
      "Check data consistency and integrity",
      "Verify indexing and query performance",
      "Test large dataset handling",
      "Validate backup and restore procedures",
      "Confirm seed scripts work correctly",
      "Check soft delete or archive behavior if implemented",
      "Ensure sensitive data is stored securely",
    ],
  },
  {
    title: "Security Testing",
    items: [
      "Test authentication security",
      "Verify password hashing functionality",
      "Validate authorization rules",
      "Test input sanitization and validation",
      "Check protection against SQL injection",
      "Test protection against XSS attacks",
      "Verify CSRF protection if applicable",
      "Confirm HTTPS and secure cookies usage",
      "Review sensitive data exposure risks",
      "Check dependency vulnerability reports",
    ],
  },
  {
    title: "Performance and Scalability Testing",
    items: [
      "Test application load times",
      "Verify server-side pagination performance",
      "Test handling of large datasets",
      "Monitor memory and CPU usage",
      "Validate caching functionality if applicable",
      "Test concurrent user scenarios",
      "Check API response times",
      "Verify application stability under stress",
      "Monitor database query performance",
      "Identify performance bottlenecks",
    ],
  },
  {
    title: "Cross-Platform and Compatibility Testing",
    items: [
      "Test on major browsers (Chrome, Firefox, Safari, Edge)",
      "Verify functionality on mobile browsers",
      "Test on Android devices",
      "Test on iOS devices",
      "Verify tablet responsiveness",
      "Test different screen resolutions",
      "Validate dark/light mode if supported",
      "Ensure compatibility with different operating systems",
    ],
  },
  {
    title: "Mobile App Testing (if applicable)",
    items: [
      "Verify mobile login and authentication",
      "Test navigation and screen transitions",
      "Validate API communication",
      "Test offline handling if implemented",
      "Verify touch interactions and gestures",
      "Test push notifications if applicable",
      "Validate device permissions usage",
      "Test app startup and loading performance",
      "Verify mobile responsiveness and layout",
      "Confirm app build and installation process",
    ],
  },
  {
    title: "Regression Testing",
    items: [
      "Re-test previously fixed bugs",
      "Verify existing features still work after updates",
      "Run automated regression test suite if available",
      "Test critical workflows after each deployment",
      "Validate compatibility with new changes",
      "Confirm no new issues were introduced",
    ],
  },
  {
    title: "Pre-Release Testing",
    items: [
      "Perform full smoke testing",
      "Verify production build configuration",
      "Confirm environment variables are correct",
      "Test deployment process",
      "Validate monitoring and logging systems",
      "Verify analytics/tracking integrations",
      "Check production database connectivity",
      "Confirm SSL certificates and domains work correctly",
      "Test backup and rollback procedures",
      "Obtain final stakeholder approval",
    ],
  },
  {
    title: "Bug Reporting and Documentation",
    items: [
      "Document discovered bugs clearly",
      "Include reproduction steps for issues",
      "Capture screenshots or recordings when necessary",
      "Assign bug severity and priority",
      "Track bug resolution status",
      "Verify fixed issues after resolution",
      "Update testing documentation",
      "Prepare final QA report",
      "Archive test results and logs",
      "Record lessons learned and improvement suggestions",
    ],
  },
] as const;

const DAILY_OPENING_RESTAURANT_CHECKLIST = [
  {
    title: "Staff Preparation",
    items: [
      "Confirm staff attendance and schedules",
      "Conduct opening team briefing",
      "Assign daily responsibilities and stations",
      "Ensure staff uniforms and hygiene standards are met",
      "Verify employee clock-in procedures",
      "Review reservations or special events for the day",
      "Confirm emergency contact information is available",
      "Check communication devices and internal systems",
    ],
  },
  {
    title: "Exterior and Entrance Inspection",
    items: [
      "Unlock entrances and exits",
      "Inspect exterior cleanliness",
      "Check signage and lighting",
      "Clean entrance doors and windows",
      "Inspect outdoor seating area if applicable",
      "Remove trash or debris outside",
      "Verify parking and access areas are safe",
      "Ensure emergency exits are unobstructed",
    ],
  },
  {
    title: "Dining Area Preparation",
    items: [
      "Clean and sanitize tables and chairs",
      "Arrange tables according to floor plan",
      "Set up menus and promotional materials",
      "Refill condiments and table supplies",
      "Verify lighting and music systems",
      "Check air conditioning/heating systems",
      "Inspect restrooms for cleanliness and supplies",
      "Ensure floors are clean and hazard-free",
      "Prepare reservation tables if needed",
      "Verify POS terminals are operational",
    ],
  },
  {
    title: "Kitchen and Food Preparation",
    items: [
      "Wash hands and sanitize workstations",
      "Inspect kitchen cleanliness",
      "Verify refrigeration and freezer temperatures",
      "Check food inventory and stock levels",
      "Inspect ingredient freshness and expiration dates",
      "Prepare food prep stations",
      "Refill cooking supplies and utensils",
      "Verify cooking equipment functionality",
      "Prepare daily specials and menu items",
      "Ensure food safety procedures are followed",
    ],
  },
  {
    title: "Beverage and Bar Setup",
    items: [
      "Prepare coffee machines and grinders",
      "Refill coffee beans, milk, and supplies",
      "Test beverage equipment functionality",
      "Prepare bar area and stock beverages",
      "Refill ice machines and ice bins",
      "Inspect glassware and cups for cleanliness",
      "Prepare garnishes and drink ingredients",
      "Verify water filtration systems if applicable",
      "Stock takeaway cups, lids, and straws",
    ],
  },
  {
    title: "Cash Register and POS Systems",
    items: [
      "Power on POS systems and terminals",
      "Verify internet and network connectivity",
      "Prepare cash drawers with starting cash",
      "Test receipt printers and scanners",
      "Verify payment terminal functionality",
      "Check online ordering systems if applicable",
      "Review previous day’s reports if needed",
      "Confirm backup payment procedures",
    ],
  },
  {
    title: "Safety and Compliance",
    items: [
      "Test fire alarms and emergency lighting if required",
      "Inspect fire extinguishers",
      "Verify first aid kit availability",
      "Check gas and electrical systems for issues",
      "Ensure cleaning chemicals are stored safely",
      "Review food safety logs",
      "Confirm security cameras are functioning",
      "Verify emergency exits and signage",
      "Inspect floors for slip hazards",
    ],
  },
  {
    title: "Inventory and Supply Check",
    items: [
      "Refill napkins, utensils, and packaging supplies",
      "Check takeaway and delivery packaging stock",
      "Verify cleaning supply levels",
      "Inspect restroom supplies",
      "Replenish hand sanitizer stations",
      "Check disposable gloves and hygiene supplies",
      "Confirm vendor deliveries if scheduled",
      "Organize storage and stock rotation",
    ],
  },
  {
    title: "Before Opening to Customers",
    items: [
      "Conduct final walkthrough of restaurant/café",
      "Verify all equipment is operational",
      "Ensure music and lighting are set correctly",
      "Confirm staff readiness at stations",
      "Unlock customer entrances",
      "Turn on exterior/open signs",
      "Review reservations and expected peak hours",
      "Prepare customer service materials",
      "Ensure all areas are clean and organized",
      "Open for service on schedule",
    ],
  },
  {
    title: "During Opening Hours",
    items: [
      "Monitor cleanliness continuously",
      "Refill supplies as needed",
      "Check customer seating flow",
      "Monitor kitchen and service efficiency",
      "Address customer issues promptly",
      "Track inventory shortages during service",
      "Maintain food safety and hygiene standards",
      "Ensure smooth communication between staff",
    ],
  },
  {
    title: "Post-Opening Review",
    items: [
      "Note any maintenance or operational issues",
      "Record missing inventory or supply needs",
      "Review customer feedback from opening period",
      "Adjust staffing or workflow if necessary",
      "Prepare notes for management or next shift",
    ],
  },
] as const;

const CLOSING_STORE_CHECKLIST = [
  {
    title: "Customer Service and Closing Procedures",
    items: [
      "Announce closing time to customers",
      "Assist remaining customers with final purchases",
      "Lock entrance doors at closing time",
      "Ensure all customers have exited safely",
      "Check fitting rooms, restrooms, and public areas",
      "Secure cash registers and POS stations",
      "Complete final customer transactions",
      "Turn off promotional displays or announcements",
      "Record unresolved customer issues if necessary",
      "Confirm no unauthorized persons remain inside",
    ],
  },
  {
    title: "Cash Handling and Financial Tasks",
    items: [
      "Count cash drawers and registers",
      "Verify daily sales totals",
      "Prepare cash deposits",
      "Reconcile POS reports and transactions",
      "Secure cash and financial documents",
      "Process end-of-day payment reports",
      "Check credit card terminal settlements",
      "Report discrepancies or unusual transactions",
      "Lock cash drawers and safes",
      "Store receipts and accounting records properly",
    ],
  },
  {
    title: "Cleaning and Organization",
    items: [
      "Clean floors and surfaces",
      "Empty trash bins and replace liners",
      "Organize shelves and displays",
      "Return misplaced items to correct locations",
      "Clean windows and entrance areas",
      "Sanitize counters and customer contact surfaces",
      "Clean restrooms and refill supplies",
      "Sweep and mop designated areas",
      "Organize stockroom and storage spaces",
      "Remove food or perishable waste if applicable",
    ],
  },
  {
    title: "Inventory and Stock Management",
    items: [
      "Restock shelves if required",
      "Check low inventory items",
      "Record damaged or missing products",
      "Verify deliveries scheduled for next day",
      "Organize incoming shipment areas",
      "Rotate stock if needed",
      "Secure high-value inventory",
      "Update inventory management system",
      "Prepare reorder notes for management",
      "Ensure storage areas are locked and organized",
    ],
  },
  {
    title: "Equipment and Technology Shutdown",
    items: [
      "Log out of POS systems",
      "Shut down computers and terminals",
      "Turn off printers and office equipment",
      "Verify backup systems completed successfully",
      "Charge handheld scanners or devices",
      "Power down unnecessary electronics",
      "Turn off music and entertainment systems",
      "Check security cameras and recording systems",
      "Ensure alarms and monitoring systems are operational",
      "Verify internet/network equipment status if required",
    ],
  },
  {
    title: "Safety and Security Checks",
    items: [
      "Lock all doors and windows",
      "Inspect emergency exits",
      "Ensure fire extinguishers are accessible",
      "Turn off unnecessary lights",
      "Verify gas appliances are turned off if applicable",
      "Check electrical equipment for safety",
      "Confirm alarm systems are activated",
      "Inspect for hazards or maintenance issues",
      "Secure confidential documents",
      "Verify all employees have exited safely",
    ],
  },
  {
    title: "Staff Closing Responsibilities",
    items: [
      "Confirm all staff clocked out properly",
      "Review shift notes or incidents",
      "Assign opening tasks for next day if needed",
      "Record maintenance or repair issues",
      "Verify uniforms or equipment are returned if required",
      "Ensure break rooms and staff areas are clean",
      "Confirm communication logs are updated",
      "Lock employee entrances and access points",
    ],
  },
  {
    title: "Exterior Inspection",
    items: [
      "Turn off exterior displays or signage if necessary",
      "Check parking lot or surrounding area",
      "Secure outdoor furniture or equipment",
      "Ensure exterior lighting is functioning appropriately",
      "Remove trash or debris near entrance",
      "Confirm delivery areas are secure",
      "Inspect storefront appearance",
    ],
  },
  {
    title: "Final Closing Walkthrough",
    items: [
      "Conduct full walkthrough of the establishment",
      "Double-check all rooms and storage areas",
      "Verify all systems are secured",
      "Ensure all appliances are turned off if required",
      "Confirm alarms are activated",
      "Lock final exit door securely",
      "Notify security or management if necessary",
      "Document closing completion if required",
      "Leave premises safely and securely",
      "Prepare for next business day operations",
    ],
  },
] as const;

const GYM_OPENING_CLOSING_CHECKLIST = [
  {
    title: "Opening Checklist",
    items: [
      "Confirm staff attendance and schedules",
      "Conduct opening team briefing",
      "Assign cleaning and operational responsibilities",
      "Ensure staff uniforms and hygiene standards are met",
      "Verify employee clock-in procedures",
      "Review class schedules and trainer appointments",
      "Confirm emergency contact information is accessible",
      "Check communication devices and internal systems",
    ],
  },
  {
    title: "Facility Inspection",
    items: [
      "Unlock entrances and emergency exits",
      "Inspect gym exterior and parking areas",
      "Turn on lights, ventilation, and climate control systems",
      "Check cleanliness of workout areas",
      "Inspect locker rooms and restrooms",
      "Refill soap, paper towels, and sanitizers",
      "Verify drinking water stations are functioning",
      "Ensure floors are dry and hazard-free",
      "Inspect mirrors and windows for cleanliness",
      "Confirm music and display systems are operational",
    ],
  },
  {
    title: "Equipment Inspection",
    items: [
      "Test cardio machines (treadmills, bikes, ellipticals)",
      "Inspect weight machines and cables",
      "Check free weights and racks for organization",
      "Verify safety pins and clips are available",
      "Test functional training equipment",
      "Inspect mats and stretching areas",
      "Check TVs and entertainment systems",
      "Report damaged or malfunctioning equipment",
      "Ensure emergency stop buttons function correctly",
      "Clean and sanitize frequently used equipment",
    ],
  },
  {
    title: "Reception and Administrative Setup",
    items: [
      "Power on computers and POS systems",
      "Verify membership management software is working",
      "Prepare cash drawer if applicable",
      "Test barcode/member access scanners",
      "Review scheduled personal training sessions",
      "Prepare towels or rental equipment if offered",
      "Check online booking and check-in systems",
      "Verify internet and Wi-Fi connectivity",
      "Organize front desk and welcome area",
      "Ensure promotional materials are displayed",
    ],
  },
  {
    title: "Safety and Security",
    items: [
      "Test emergency lighting if required",
      "Verify fire extinguishers are accessible",
      "Check first aid kit supplies",
      "Ensure AED device is operational if available",
      "Inspect emergency exits and signage",
      "Verify security cameras are functioning",
      "Test alarm systems if applicable",
      "Ensure cleaning chemicals are stored safely",
      "Review safety procedures with staff",
    ],
  },
  {
    title: "Before Opening to Members",
    items: [
      "Conduct final walkthrough of facility",
      "Confirm all equipment is operational",
      "Ensure locker rooms are fully stocked",
      "Turn on entrance/open signs",
      "Verify class rooms and studios are ready",
      "Confirm trainers and instructors are prepared",
      "Open facility on schedule",
      "Welcome first members professionally",
    ],
  },
  {
    title: "Closing Checklist",
    items: [
      "Announce closing time to members",
      "Ensure all members exit the facility safely",
      "Check locker rooms, showers, and studios",
      "Confirm all rental equipment is returned",
      "Lock entrances after closing",
      "Verify no unauthorized persons remain inside",
      "Record unresolved customer issues if needed",
    ],
  },
  {
    title: "Cleaning and Sanitization",
    items: [
      "Sanitize all gym equipment",
      "Wipe down cardio and weight machines",
      "Clean mirrors and windows",
      "Vacuum or mop floors",
      "Empty trash bins and replace liners",
      "Clean locker rooms and showers",
      "Refill hygiene and cleaning supplies",
      "Organize weights and equipment properly",
      "Disinfect high-touch surfaces",
      "Remove towels and laundry if applicable",
    ],
  },
  {
    title: "Equipment and Maintenance Checks",
    items: [
      "Power down cardio equipment if required",
      "Inspect equipment for damage or wear",
      "Report maintenance issues",
      "Charge wireless devices or tablets if applicable",
      "Store portable equipment securely",
      "Verify all TVs and sound systems are turned off",
      "Check ventilation and climate systems",
      "Ensure all equipment is safely stored",
    ],
  },
  {
    title: "Reception and Administrative Tasks",
    items: [
      "Count cash drawer and reconcile transactions",
      "Log out of POS and management systems",
      "Process end-of-day reports",
      "Secure financial documents and cash deposits",
      "Back up attendance or booking data if required",
      "Review membership or booking issues",
      "Prepare schedule and notes for next day",
      "Secure member information and records",
    ],
  },
  {
    title: "Safety and Security Closing Checks",
    items: [
      "Turn off unnecessary lights",
      "Verify emergency exits are secure",
      "Check fire extinguishers and safety equipment visibility",
      "Ensure all doors and windows are locked",
      "Activate alarm and security systems",
      "Verify security cameras are recording properly",
      "Inspect facility for hazards or leaks",
      "Secure cleaning chemicals and supplies",
      "Confirm all staff have exited safely",
    ],
  },
  {
    title: "Final Walkthrough",
    items: [
      "Conduct complete walkthrough of facility",
      "Double-check all rooms and storage areas",
      "Ensure all systems are shut down properly",
      "Confirm music and entertainment systems are off",
      "Lock final exit securely",
      "Document closing completion if required",
      "Leave premises safely and securely",
    ],
  },
] as const;

const SAMPLE_USERS = [
  { email: "steve@gmail.com", name: "Steve" },
  { email: "peter@gmail.com", name: "Peter" },
  { email: "dave@gmail.com", name: "Dave" },
  { email: "john@gmail.com", name: "John" },
  { email: "nick@gmail.com", name: "Nick" },
  ...Array.from({ length: 9 }, (_, index) => {
    const userNumber = index + 1;

    return {
      email: `user${userNumber}@gmail.com`,
      name: `User ${userNumber}`,
    };
  }),
] as const;

const BCRYPT_SALT_ROUNDS = 12;

async function findOrCreateSystemAdmin() {
  const email = "system-admin@checklisthub.local";
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    if (!existingUser.passwordHash.startsWith("$2")) {
      await db
        .update(users)
        .set({
          passwordHash: await bcrypt.hash(randomUUID(), BCRYPT_SALT_ROUNDS),
        })
        .where(eq(users.id, existingUser.id));
    }

    return existingUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      email,
      name: "ChecklistHub System Admin",
      passwordHash: await bcrypt.hash(randomUUID(), BCRYPT_SALT_ROUNDS),
      role: "admin",
    })
    .returning();

  return createdUser;
}

async function seedSampleUsers() {
  const passwordHash = await bcrypt.hash("pass123", BCRYPT_SALT_ROUNDS);

  for (const user of SAMPLE_USERS) {
    await db
      .insert(users)
      .values({
        ...user,
        passwordHash,
        role: "user",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: user.name,
          passwordHash,
          role: "user",
        },
      });
  }
}

const FIRST_AID_KIT_CHECKLIST = [
  {
    title: "Inspection Preparation",
    items: [
      "Choose clean and well-lit inspection area",
      "Gather inventory list for the first aid kit",
      "Check inspection date and maintenance schedule",
      "Wear clean gloves if necessary",
      "Prepare replacement supplies if available",
      "Verify emergency contact information is included",
      "Ensure kit is easily accessible",
      "Check kit labeling and identification",
    ],
  },
  {
    title: "General Kit Condition",
    items: [
      "Inspect first aid kit container for damage",
      "Verify kit is clean and dry",
      "Check latches, zippers, or seals",
      "Ensure waterproof protection if applicable",
      "Confirm kit organization and compartments",
      "Remove dirt, dust, or debris",
      "Verify instruction manual is included",
      "Ensure flashlight or emergency tools are functional",
    ],
  },
  {
    title: "Medical Supply Inspection",
    items: [
      "Check expiration dates on all medical supplies",
      "Replace expired items",
      "Verify sterile packaging is intact",
      "Inspect adhesive bandages for usability",
      "Check gauze pads and rolls",
      "Inspect medical tape condition",
      "Verify antiseptic wipes and solutions",
      "Check burn treatment supplies",
      "Inspect gloves for tears or damage",
      "Ensure scissors and tweezers are clean and functional",
    ],
  },
  {
    title: "Medication Inspection",
    items: [
      "Check expiration dates on medications",
      "Replace expired pain relievers",
      "Inspect allergy medication availability",
      "Verify antiseptic creams or ointments",
      "Check motion sickness medication if included",
      "Ensure dosage instructions are readable",
      "Store medications properly according to guidelines",
      "Remove damaged or leaking medication packages",
    ],
  },
  {
    title: "Emergency Equipment Check",
    items: [
      "Test flashlight functionality",
      "Replace flashlight batteries if needed",
      "Inspect emergency whistle",
      "Check CPR mask or shield condition",
      "Verify emergency blanket packaging",
      "Inspect instant cold packs",
      "Check thermometer functionality",
      "Verify emergency contact cards are current",
      "Ensure multi-tool or knife is functional if included",
    ],
  },
  {
    title: "Inventory and Restocking",
    items: [
      "Count remaining supplies",
      "Refill low-stock items",
      "Replace used or missing supplies",
      "Verify kit matches recommended inventory list",
      "Add specialized supplies if needed for environment or activities",
      "Organize items for easy access",
      "Remove unnecessary or damaged items",
      "Label newly added supplies if necessary",
    ],
  },
  {
    title: "Hygiene and Safety",
    items: [
      "Ensure hand sanitizer is available",
      "Verify disposable gloves quantity",
      "Inspect face masks if included",
      "Check biohazard disposal bags if applicable",
      "Confirm cleanliness of reusable tools",
      "Sanitize reusable equipment",
      "Store sharp objects safely",
      "Ensure no contamination is present inside kit",
    ],
  },
  {
    title: "Specialized Equipment (if applicable)",
    items: [
      "Inspect splints or braces",
      "Check blood pressure monitor functionality",
      "Verify epinephrine auto-injector expiration date",
      "Test communication devices if included",
      "Inspect trauma shears and emergency tools",
      "Verify oxygen supplies if applicable",
      "Check emergency airway equipment condition",
    ],
  },
  {
    title: "Before Completing Inspection",
    items: [
      "Reorganize kit contents neatly",
      "Ensure quick-access items are visible",
      "Confirm all compartments close securely",
      "Update inspection log or checklist",
      "Record replaced or expired items",
      "Schedule next inspection date",
      "Return kit to accessible location",
      "Inform responsible persons of completed inspection",
    ],
  },
  {
    title: "Emergency Readiness Review",
    items: [
      "Review basic first aid procedures",
      "Ensure users know kit location",
      "Confirm emergency phone numbers are updated",
      "Verify accessibility during emergencies",
      "Review evacuation or emergency response plans",
      "Train household/team members on kit usage if needed",
      "Ensure portable kits are travel-ready",
      "Keep first aid kit protected from extreme temperatures",
    ],
  },
] as const;

async function seedFirstAidKitTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Safety",
      slug: "safety",
      description: "Checklist templates for safety and emergency preparedness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Safety",
        description: "Checklist templates for safety and emergency preparedness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "First Aid",
      slug: "first-aid",
      description: "First aid kit inspection and readiness.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "First Aid",
        description: "First aid kit inspection and readiness.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "First Aid Kit Inspection Checklist",
      slug: "first-aid-kit-inspection-checklist",
      description: "Inspection checklist to ensure first aid kits are stocked, functional, and ready for emergencies.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "First Aid Kit Inspection Checklist",
        description: "Inspection checklist to ensure first aid kits are stocked, functional, and ready for emergencies.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of FIRST_AID_KIT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}
const WEEKLY_MEAL_PREP_CHECKLIST = [
  {
    title: "Meal Planning",
    items: [
      "Decide meals for the week",
      "Set nutrition and calorie goals",
      "Review dietary restrictions or preferences",
      "Plan breakfasts, lunches, dinners, and snacks",
      "Choose recipes for the week",
      "Balance proteins, carbohydrates, and vegetables",
      "Plan portion sizes",
      "Schedule meal prep day and cooking time",
      "Include quick or backup meal options",
      "Check upcoming events or busy days affecting meals",
    ],
  },
  {
    title: "Inventory and Kitchen Check",
    items: [
      "Check pantry ingredients",
      "Inspect refrigerator contents",
      "Check freezer inventory",
      "Identify ingredients that need to be used soon",
      "Verify spices and seasonings availability",
      "Check cooking oil and condiments",
      "Review expiration dates on food items",
      "Ensure food storage containers are available",
      "Check meal prep tools and equipment",
      "Prepare shopping list for missing ingredients",
    ],
  },
  {
    title: "Grocery Shopping",
    items: [
      "Organize shopping list by category",
      "Purchase fresh fruits and vegetables",
      "Buy protein sources (meat, fish, eggs, tofu, etc.)",
      "Purchase grains and carbohydrates",
      "Buy healthy snacks",
      "Purchase beverages if needed",
      "Buy meal prep containers or storage bags if necessary",
      "Check for discounts or bulk-buy opportunities",
      "Verify cold/frozen items stay refrigerated during transport",
      "Store groceries properly after shopping",
    ],
  },
  {
    title: "Food Preparation",
    items: [
      "Wash fruits and vegetables",
      "Chop vegetables and ingredients",
      "Marinate proteins if needed",
      "Cook grains and carbohydrates",
      "Prepare proteins for multiple meals",
      "Portion snacks into containers",
      "Prepare sauces or dressings",
      "Label containers with meal names or dates",
      "Cool cooked food before refrigeration",
      "Store meals safely in refrigerator or freezer",
    ],
  },
  {
    title: "Kitchen Organization and Cleaning",
    items: [
      "Clean countertops and prep areas",
      "Sanitize cutting boards and utensils",
      "Wash dishes and cookware",
      "Organize refrigerator and freezer space",
      "Dispose of food waste properly",
      "Empty trash and recycling bins",
      "Store ingredients and leftovers correctly",
      "Prepare clean containers for next use",
      "Check refrigerator temperature settings",
      "Refill kitchen essentials if needed",
    ],
  },
  {
    title: "Nutrition and Health",
    items: [
      "Track protein and nutrient intake",
      "Prepare balanced meal portions",
      "Limit processed or unhealthy foods",
      "Include healthy snacks and hydration options",
      "Plan meals around fitness or activity schedule",
      "Prepare meals that support energy and recovery",
      "Avoid excessive sugar or sodium",
      "Monitor portion control",
      "Include fiber-rich foods and vegetables",
      "Prepare hydration reminders or water bottles",
    ],
  },
  {
    title: "Time and Workflow Optimization",
    items: [
      "Group similar cooking tasks together",
      "Use timers for cooking efficiency",
      "Prioritize meals with shortest shelf life",
      "Freeze meals for later in the week if necessary",
      "Prepare grab-and-go meals for busy days",
      "Minimize food waste through planning",
      "Batch cook ingredients when possible",
      "Organize prep sequence efficiently",
      "Keep frequently used tools accessible",
      "Plan cleanup during cooking process",
    ],
  },
  {
    title: "Before Finishing Meal Prep",
    items: [
      "Double-check meal portions and labels",
      "Verify food is stored safely",
      "Ensure refrigerator/freezer doors are sealed properly",
      "Review meal schedule for the week",
      "Prepare utensils or lunch bags if needed",
      "Set reminders for defrosting frozen meals",
      "Confirm enough snacks and drinks are available",
      "Take note of ingredients running low",
      "Clean and reset kitchen for next use",
      "Relax and enjoy completed meal prep",
    ],
  },
  {
    title: "During the Week",
    items: [
      "Monitor freshness of prepared meals",
      "Reheat food safely",
      "Rotate meals to avoid spoilage",
      "Refill water and healthy snack supplies",
      "Adjust meal plan if schedule changes",
      "Track nutrition goals and energy levels",
      "Freeze leftovers before expiration if needed",
      "Restock missing ingredients when necessary",
      "Clean meal prep containers regularly",
      "Review what worked well for future meal prep planning",
    ],
  },
] as const;

async function seedWeeklyMealPrepTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Home",
      slug: "home",
      description: "Checklist templates for home tasks, maintenance, and routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Home",
        description: "Checklist templates for home tasks, maintenance, and routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Weekly Meal Prep",
      slug: "weekly-meal-prep",
      description: "Planning and preparation checklist for weekly meal prepping.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Weekly Meal Prep",
        description: "Planning and preparation checklist for weekly meal prepping.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Weekly Meal Prep Planning Checklist",
      slug: "weekly-meal-prep-planning-checklist",
      description: "A structured checklist for planning, shopping, prepping, and managing weekly meals.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Weekly Meal Prep Planning Checklist",
        description: "A structured checklist for planning, shopping, prepping, and managing weekly meals.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of WEEKLY_MEAL_PREP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

const FITNESS_COMPETITION_CHECKLIST = [
  {
    title: "Competition Planning",
    items: [
      "Confirm competition date and location",
      "Review competition rules and categories",
      "Complete registration and payment",
      "Verify qualification requirements if applicable",
      "Plan travel and accommodation",
      "Prepare competition timeline and schedule",
      "Review judging criteria",
      "Set performance and physique goals",
      "Inform coach or support team about schedule",
      "Prepare emergency contact information",
    ],
  },
  {
    title: "Training Preparation",
    items: [
      "Follow structured training program",
      "Practice competition poses or routines",
      "Monitor workout intensity and recovery",
      "Focus on weak muscle groups if needed",
      "Track progress with photos and measurements",
      "Schedule rest and recovery days",
      "Avoid overtraining before competition",
      "Practice stage presence and transitions",
      "Review posing or performance choreography",
      "Prepare final peak-week strategy",
    ],
  },
  {
    title: "Nutrition and Hydration",
    items: [
      "Follow competition meal plan",
      "Prepare meals and snacks in advance",
      "Track calorie and macronutrient intake",
      "Stay hydrated consistently",
      "Monitor sodium and water manipulation if required",
      "Avoid unfamiliar foods before competition",
      "Prepare competition-day meals",
      "Pack supplements if used",
      "Bring electrolyte drinks if needed",
      "Follow coach or nutritionist guidance carefully",
    ],
  },
  {
    title: "Physical Appearance Preparation",
    items: [
      "Schedule haircut or grooming appointment",
      "Prepare competition tan or tanning products",
      "Practice posing with competition attire",
      "Inspect skin condition and hydration",
      "Prepare shaving or waxing if required",
      "Pack resistance bands for pump-up",
      "Prepare makeup and hair products if applicable",
      "Check nails and personal grooming",
      "Test stage lighting appearance if possible",
      "Prepare backup grooming supplies",
    ],
  },
  {
    title: "Competition Clothing and Gear",
    items: [
      "Prepare competition outfit or suit",
      "Check outfit fit and condition",
      "Bring backup outfit if possible",
      "Pack posing trunks or stage wear",
      "Prepare comfortable warm-up clothing",
      "Bring flip-flops or comfortable shoes",
      "Pack towels and hygiene products",
      "Prepare gym bag and accessories",
      "Bring resistance bands or light weights for warm-up",
      "Pack safety pins, clips, or sewing kit for emergencies",
    ],
  },
  {
    title: "Health and Recovery",
    items: [
      "Get adequate sleep before competition",
      "Monitor stress and recovery levels",
      "Stretch and mobility work regularly",
      "Avoid unnecessary physical strain",
      "Prepare personal medications if needed",
      "Monitor for signs of fatigue or dehydration",
      "Schedule massage or recovery sessions if appropriate",
      "Practice relaxation and mental focus techniques",
      "Maintain healthy digestion and energy levels",
    ],
  },
  {
    title: "Technology and Documentation",
    items: [
      "Prepare identification documents",
      "Bring registration confirmation",
      "Save event schedule and venue information",
      "Charge phone and electronic devices",
      "Pack phone charger or power bank",
      "Bring camera or tripod if desired",
      "Save coach or team contact information",
      "Prepare music file if routine requires it",
      "Back up important digital files",
    ],
  },
  {
    title: "Before Leaving for the Competition",
    items: [
      "Double-check all packed items",
      "Confirm travel arrangements and timing",
      "Prepare food and water for travel",
      "Check weather forecast",
      "Fuel vehicle if driving",
      "Ensure all competition documents are packed",
      "Leave early to avoid delays",
      "Relax and stay mentally focused",
      "Review competition schedule one final time",
      "Confirm communication with coach or team",
    ],
  },
  {
    title: "At the Competition Venue",
    items: [
      "Check in and register upon arrival",
      "Verify stage schedule and call times",
      "Inspect backstage area",
      "Prepare competition attire and tanning setup",
      "Warm up muscles before stage time",
      "Practice posing and breathing techniques",
      "Stay hydrated and energized",
      "Monitor physical appearance and pump-up timing",
      "Listen for stage announcements and instructions",
      "Stay calm and focused before performing",
    ],
  },
  {
    title: "During the Competition",
    items: [
      "Follow stage directions carefully",
      "Maintain confident posture and presentation",
      "Control breathing and posing transitions",
      "Stay aware of judges’ instructions",
      "Monitor hydration and energy levels",
      "Support team communication if applicable",
      "Avoid unnecessary stress or distractions",
      "Maintain professionalism and sportsmanship",
      "Focus on performance rather than competitors",
      "Enjoy the competition experience",
    ],
  },
  {
    title: "After the Competition",
    items: [
      "Cool down and stretch",
      "Rehydrate and eat recovery food",
      "Remove tanning products and clean up",
      "Pack equipment and personal items",
      "Review feedback and results",
      "Take progress photos if desired",
      "Rest and recover properly",
      "Plan post-competition recovery and training",
      "Celebrate achievements and lessons learned",
    ],
  },
] as const;

async function seedFitnessCompetitionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Fitness",
      slug: "fitness",
      description: "Checklist templates for gyms, fitness centers, wellness, and exercise facilities.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Fitness",
        description:
          "Checklist templates for gyms, fitness centers, wellness, and exercise facilities.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Fitness Competition",
      slug: "fitness-competition",
      description: "Preparation and competition-day checklist for fitness competitions.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Fitness Competition",
        description: "Preparation and competition-day checklist for fitness competitions.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Fitness Competition Preparation Checklist",
      slug: "fitness-competition-preparation-checklist",
      description: "Checklist for preparing, competing, and recovering from fitness competitions.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Fitness Competition Preparation Checklist",
        description: "Checklist for preparing, competing, and recovering from fitness competitions.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of FITNESS_COMPETITION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

const MOTORCYCLE_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose destination and travel route",
      "Review road and weather conditions",
      "Estimate daily riding distance and travel time",
      "Plan fuel stops and rest breaks",
      "Book accommodations if needed",
      "Share itinerary with family or friends",
      "Identify emergency contact information",
      "Download offline maps and navigation routes",
      "Research local traffic laws and restrictions",
      "Prepare backup route options",
    ],
  },
  {
    title: "Motorcycle Inspection",
    items: [
      "Check engine oil level",
      "Inspect coolant level if applicable",
      "Check brake fluid levels",
      "Inspect tires for wear and damage",
      "Verify tire pressure",
      "Check chain or belt condition and tension",
      "Test front and rear brakes",
      "Inspect lights and turn signals",
      "Verify horn functionality",
      "Check battery condition",
    ],
  },
  {
    title: "Safety Gear",
    items: [
      "Inspect helmet for damage",
      "Bring riding jacket with protection",
      "Wear riding gloves",
      "Prepare riding pants or protective gear",
      "Wear proper motorcycle boots",
      "Pack rain gear",
      "Bring reflective vest if needed",
      "Carry ear protection for long rides",
      "Pack sunglasses or tinted visor",
      "Prepare cold-weather layers if necessary",
    ],
  },
  {
    title: "Documents and Legal Requirements",
    items: [
      "Carry motorcycle license",
      "Bring registration documents",
      "Verify insurance coverage",
      "Pack roadside assistance information",
      "Prepare identification documents",
      "Check toll payment methods if needed",
      "Carry spare key if available",
      "Save emergency phone numbers",
    ],
  },
  {
    title: "Navigation and Technology",
    items: [
      "Charge phone and GPS devices",
      "Mount navigation system securely",
      "Download offline maps",
      "Pack phone charger or power bank",
      "Test Bluetooth/intercom systems",
      "Bring action camera if desired",
      "Verify communication devices functionality",
      "Prepare emergency contact information in phone",
    ],
  },
  {
    title: "Luggage and Packing",
    items: [
      "Secure saddlebags or luggage properly",
      "Pack lightweight and essential items only",
      "Bring extra clothing and socks",
      "Pack toiletries and hygiene items",
      "Carry snacks and drinking water",
      "Bring basic tool kit",
      "Pack tire repair kit and air pump",
      "Carry first aid kit",
      "Store valuables in waterproof bags",
      "Balance luggage weight evenly",
    ],
  },
  {
    title: "Emergency and Maintenance Supplies",
    items: [
      "Pack flashlight or headlamp",
      "Bring spare fuses and bulbs",
      "Carry jumper cables or battery starter if possible",
      "Bring multi-tool or repair tools",
      "Pack emergency blanket",
      "Carry chain lubricant if needed",
      "Prepare cleaning cloths and gloves",
      "Verify roadside emergency kit availability",
      "Bring zip ties and duct tape for quick fixes",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Fill fuel tank completely",
      "Check weather forecast one final time",
      "Test motorcycle lights and brakes",
      "Secure all luggage and straps",
      "Warm up motorcycle engine",
      "Confirm route and navigation settings",
      "Inform emergency contact before leaving",
      "Wear all safety gear properly",
      "Start trip well-rested and hydrated",
      "Leave early to maximize daylight riding",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor fuel levels regularly",
      "Take regular breaks to avoid fatigue",
      "Stay hydrated",
      "Check motorcycle condition during stops",
      "Monitor tire condition and pressure",
      "Watch weather and road changes",
      "Ride within speed limits and conditions",
      "Maintain safe following distance",
      "Secure belongings during stops",
      "Stay alert for road hazards",
    ],
  },
  {
    title: "After the Trip",
    items: [
      "Inspect motorcycle for damage or wear",
      "Clean motorcycle thoroughly",
      "Refill fuel if needed",
      "Recharge electronics and communication devices",
      "Clean and store riding gear properly",
      "Lubricate chain if applicable",
      "Review trip notes and route performance",
      "Back up photos or ride recordings",
      "Restock emergency supplies",
      "Schedule maintenance if required",
    ],
  },
] as const;

async function seedMotorcycleTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Travel",
      slug: "travel",
      description: "Checklist templates for travel, trips, and transportation.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Travel",
        description: "Checklist templates for travel, trips, and transportation.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Motorcycle Trip",
      slug: "motorcycle-trip",
      description: "Preparation and inspection checklist for motorcycle trips.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Motorcycle Trip",
        description: "Preparation and inspection checklist for motorcycle trips.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Motorcycle Trip Preparation Checklist",
      slug: "motorcycle-trip-preparation-checklist",
      description: "A checklist covering planning, inspection, safety gear, documents, navigation, packing, emergencies, and post-trip tasks for motorcycle journeys.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Motorcycle Trip Preparation Checklist",
        description: "A checklist covering planning, inspection, safety gear, documents, navigation, packing, emergencies, and post-trip tasks for motorcycle journeys.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of MOTORCYCLE_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}
const BICYCLE_RACE_CHECKLIST = [
  {
    title: "Race Planning",
    items: [
      "Confirm race date and start time",
      "Review race route and elevation profile",
      "Verify registration and race confirmation",
      "Check race rules and requirements",
      "Plan transportation to race location",
      "Book accommodation if necessary",
      "Prepare race-day schedule",
      "Identify parking and arrival procedures",
      "Review weather forecast",
      "Inform emergency contact about race plans",
    ],
  },
  {
    title: "Bicycle Inspection",
    items: [
      "Clean bicycle thoroughly",
      "Inspect frame for cracks or damage",
      "Check tire pressure",
      "Inspect tires for wear or punctures",
      "Verify wheel alignment and spoke tension",
      "Test brakes and brake pads",
      "Lubricate chain and drivetrain",
      "Check gear shifting performance",
      "Tighten bolts and quick releases",
      "Test pedals and cleats",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Inspect helmet for damage",
      "Prepare cycling gloves",
      "Bring cycling sunglasses",
      "Wear reflective gear if needed",
      "Pack front and rear lights if required",
      "Carry identification and medical information",
      "Prepare first aid supplies for travel",
      "Bring sunscreen and lip balm",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Prepare cycling jersey and shorts",
      "Pack weather-appropriate layers",
      "Bring cycling shoes",
      "Pack extra socks",
      "Prepare rain jacket if needed",
      "Bring warm-up clothing",
      "Pack towel and hygiene supplies",
      "Carry post-race change of clothes",
      "Prepare race bib attachment pins or belt",
    ],
  },
  {
    title: "Nutrition and Hydration",
    items: [
      "Plan pre-race meals",
      "Prepare energy gels or bars",
      "Fill water bottles",
      "Pack electrolyte drinks",
      "Test race nutrition strategy in advance",
      "Avoid unfamiliar foods before race",
      "Prepare recovery snacks for after the race",
      "Stay hydrated before race day",
    ],
  },
  {
    title: "Technology and Electronics",
    items: [
      "Charge cycling computer or GPS device",
      "Test heart rate monitor or sensors",
      "Charge lights and electronic accessories",
      "Download race route to navigation device",
      "Prepare phone charger or power bank",
      "Verify timing chip if applicable",
      "Test wireless shifting systems if used",
      "Back up training and route data if needed",
    ],
  },
  {
    title: "Training and Physical Preparation",
    items: [
      "Follow taper or recovery plan before race",
      "Get adequate sleep before race day",
      "Stretch and warm up properly",
      "Avoid overtraining close to race day",
      "Stay hydrated during final training days",
      "Review pacing strategy",
      "Practice race starts and transitions if needed",
      "Monitor physical condition and injuries",
    ],
  },
  {
    title: "Before Leaving for the Race",
    items: [
      "Double-check all gear and equipment",
      "Secure bicycle for transport",
      "Prepare race documents and ID",
      "Confirm race start location and time",
      "Check weather conditions again",
      "Fuel vehicle if driving",
      "Arrive with enough time before start",
      "Pack emergency repair kit and pump",
      "Bring spare tubes or tire repair supplies",
      "Ensure all electronics are charged",
    ],
  },
  {
    title: "At the Race Venue",
    items: [
      "Register or check in if required",
      "Pick up race packet and bib",
      "Attach race number properly",
      "Inspect bicycle one final time",
      "Warm up before the race",
      "Test brakes and gears briefly",
      "Use restroom before start",
      "Hydrate and eat light pre-race snack",
      "Review race strategy and pacing",
      "Move to starting area on time",
    ],
  },
  {
    title: "During the Race",
    items: [
      "Pace effort appropriately",
      "Stay hydrated and fueled",
      "Monitor surroundings and competitors",
      "Follow race rules and course markings",
      "Ride safely in groups or pelotons",
      "Watch for hazards on the road/trail",
      "Maintain focus and energy management",
      "Communicate clearly with nearby riders",
      "Monitor bike performance during race",
      "Finish safely and strongly",
    ],
  },
  {
    title: "After the Race",
    items: [
      "Cool down and stretch",
      "Rehydrate and eat recovery food",
      "Inspect bicycle for damage",
      "Clean and store equipment",
      "Review race performance and results",
      "Recharge electronic devices",
      "Back up race data and photos",
      "Treat any injuries or soreness",
      "Rest and recover properly",
      "Plan improvements for future races",
    ],
  },
] as const;

async function seedBicycleRaceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Cycling",
      slug: "cycling",
      description: "Checklist templates for cycling events, training, and rides.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Cycling",
        description: "Checklist templates for cycling events, training, and rides.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Bicycle Race",
      slug: "bicycle-race",
      description: "Preparation and race-day checklist for bicycle races.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Bicycle Race",
        description: "Preparation and race-day checklist for bicycle races.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Bicycle Race Preparation Checklist",
      slug: "bicycle-race-preparation-checklist",
      description: "Comprehensive checklist for preparing, racing, and recovering from bicycle races.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Bicycle Race Preparation Checklist",
        description: "Comprehensive checklist for preparing, racing, and recovering from bicycle races.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of BICYCLE_RACE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}


async function seedScubaDivingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Diving",
      slug: "diving",
      description: "Checklist templates for scuba diving and other underwater activities.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Diving",
        description: "Checklist templates for scuba diving and other underwater activities.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Scuba Diving",
      slug: "scuba-diving",
      description: "Preparation and safety workflows for recreational scuba dives.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Scuba Diving",
        description: "Preparation and safety workflows for recreational scuba dives.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Scuba Diving Preparation Checklist",
      slug: "scuba-diving-preparation-checklist",
      description:
        "A comprehensive pre-dive, in-water, and post-dive checklist for recreational scuba diving preparation.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Scuba Diving Preparation Checklist",
        description:
          "A comprehensive pre-dive, in-water, and post-dive checklist for recreational scuba diving preparation.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of SCUBA_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedGymOpeningClosingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Fitness",
      slug: "fitness",
      description: "Checklist templates for gyms, fitness centers, wellness, and exercise facilities.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Fitness",
        description:
          "Checklist templates for gyms, fitness centers, wellness, and exercise facilities.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Gym Operations",
      slug: "gym-operations",
      description:
        "Opening and closing procedures, facility checks, equipment setup, safety, cleaning, and administrative tasks for gyms and fitness centers.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Gym Operations",
        description:
          "Opening and closing procedures, facility checks, equipment setup, safety, cleaning, and administrative tasks for gyms and fitness centers.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Gym Opening / Closing Checklist",
      slug: "gym-opening-closing-checklist",
      description:
        "A gym opening and closing checklist covering staff preparation, facility inspection, equipment checks, reception setup, safety, member opening and closing procedures, cleaning, maintenance, administration, and final walkthroughs.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Gym Opening / Closing Checklist",
        description:
          "A gym opening and closing checklist covering staff preparation, facility inspection, equipment checks, reception setup, safety, member opening and closing procedures, cleaning, maintenance, administration, and final walkthroughs.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of GYM_OPENING_CLOSING_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedDronePreflightTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Drone Operations",
      slug: "drone-operations",
      description: "Checklist templates for drone flights, missions, and equipment readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Drone Operations",
        description: "Checklist templates for drone flights, missions, and equipment readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Drone Pre-Flight",
      slug: "drone-pre-flight",
      description: "Pre-flight safety and equipment checks for drone operators.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Drone Pre-Flight",
        description: "Pre-flight safety and equipment checks for drone operators.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Pre-Flight Preparation Checklist for Drone Operators",
      slug: "drone-operator-pre-flight-preparation-checklist",
      description:
        "A practical drone operator checklist covering personal readiness, aircraft inspection, environment assessment, flight setup, flight monitoring, and post-flight actions.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Pre-Flight Preparation Checklist for Drone Operators",
        description:
          "A practical drone operator checklist covering personal readiness, aircraft inspection, environment assessment, flight setup, flight monitoring, and post-flight actions.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of DRONE_PREFLIGHT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedInternationalTravelTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Travel",
      slug: "travel",
      description: "Checklist templates for trip planning, packing, and travel safety.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Travel",
        description: "Checklist templates for trip planning, packing, and travel safety.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "International Travel",
      slug: "international-travel",
      description: "Preparation workflows for international trips and airport departure.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "International Travel",
        description: "Preparation workflows for international trips and airport departure.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for International Travel Checklist",
      slug: "preparation-for-international-travel-checklist",
      description:
        "A comprehensive international travel checklist covering documents, money, health, packing, home preparation, airport departure, and travel safety.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for International Travel Checklist",
        description:
          "A comprehensive international travel checklist covering documents, money, health, packing, home preparation, airport departure, and travel safety.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of INTERNATIONAL_TRAVEL_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedCampingHikingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Camping and Hiking",
      slug: "camping-and-hiking",
      description: "Trip planning, packing, campsite, hiking, and return-home preparation.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Camping and Hiking",
        description: "Trip planning, packing, campsite, hiking, and return-home preparation.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Camping and Hiking Checklist",
      slug: "camping-and-hiking-checklist",
      description:
        "A complete camping and hiking checklist for planning, gear, food, safety, campsite setup, trail awareness, and cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Camping and Hiking Checklist",
        description:
          "A complete camping and hiking checklist for planning, gear, food, safety, campsite setup, trail awareness, and cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CAMPING_HIKING_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedHikingSafetyTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Hiking Safety",
      slug: "hiking-safety",
      description: "Trail planning, clothing, navigation, supplies, safety equipment, and hike wrap-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Hiking Safety",
        description:
          "Trail planning, clothing, navigation, supplies, safety equipment, and hike wrap-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Hiking Safety Checklist",
      slug: "hiking-safety-checklist",
      description:
        "A hiking safety checklist covering trip planning, clothing, navigation, food and water, emergency equipment, trail safety, readiness, gear checks, departure, the hike, and post-hike tasks.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Hiking Safety Checklist",
        description:
          "A hiking safety checklist covering trip planning, clothing, navigation, food and water, emergency equipment, trail safety, readiness, gear checks, departure, the hike, and post-hike tasks.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of HIKING_SAFETY_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedTentCampingTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Tent Camping Trip",
      slug: "tent-camping-trip",
      description: "Planning, packing, setup, trip management, and cleanup for tent camping.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Tent Camping Trip",
        description: "Planning, packing, setup, trip management, and cleanup for tent camping.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Organizing a Camping Trip with a Tent Checklist",
      slug: "organizing-a-camping-trip-with-a-tent-checklist",
      description:
        "A tent camping checklist covering planning, shelter gear, clothing, cooking, safety, camp setup, recreation, travel prep, trip routines, and return-home cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Organizing a Camping Trip with a Tent Checklist",
        description:
          "A tent camping checklist covering planning, shelter gear, clothing, cooking, safety, camp setup, recreation, travel prep, trip routines, and return-home cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of TENT_CAMPING_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedRoadTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Travel",
      slug: "travel",
      description: "Checklist templates for trip planning, packing, and travel safety.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Travel",
        description: "Checklist templates for trip planning, packing, and travel safety.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Road Trip",
      slug: "road-trip",
      description: "Route planning, vehicle readiness, packing, driving safety, and arrival tasks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Road Trip",
        description: "Route planning, vehicle readiness, packing, driving safety, and arrival tasks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for a Road Trip Checklist",
      slug: "preparation-for-a-road-trip-checklist",
      description:
        "A road trip preparation checklist covering route planning, vehicle inspection, emergency supplies, documents, packing, navigation, comfort, departure, driving, and arrival.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for a Road Trip Checklist",
        description:
          "A road trip preparation checklist covering route planning, vehicle inspection, emergency supplies, documents, packing, navigation, comfort, departure, driving, and arrival.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of ROAD_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedPhotoShootTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Photography and Media",
      slug: "photography-and-media",
      description: "Checklist templates for photography, video, and creative production work.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Photography and Media",
        description: "Checklist templates for photography, video, and creative production work.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Photo Shoot",
      slug: "photo-shoot",
      description: "Planning, equipment, team coordination, shooting, and file management.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Photo Shoot",
        description: "Planning, equipment, team coordination, shooting, and file management.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for a Photo Shoot Checklist",
      slug: "preparation-for-a-photo-shoot-checklist",
      description:
        "A photo shoot preparation checklist covering planning, camera and lighting gear, styling, team coordination, file management, shoot execution, and wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for a Photo Shoot Checklist",
        description:
          "A photo shoot preparation checklist covering planning, camera and lighting gear, styling, team coordination, file management, shoot execution, and wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of PHOTO_SHOOT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedVideoProductionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Photography and Media",
      slug: "photography-and-media",
      description: "Checklist templates for photography, video, and creative production work.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Photography and Media",
        description: "Checklist templates for photography, video, and creative production work.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Video Production",
      slug: "video-production",
      description: "Planning, filming day preparation, crew coordination, and media management.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Video Production",
        description: "Planning, filming day preparation, crew coordination, and media management.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for Video Production / Filming Day Checklist",
      slug: "preparation-for-video-production-filming-day-checklist",
      description:
        "A filming day checklist covering pre-production, camera, audio, lighting, set prep, crew coordination, file management, filming, and wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for Video Production / Filming Day Checklist",
        description:
          "A filming day checklist covering pre-production, camera, audio, lighting, set prep, crew coordination, file management, filming, and wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of VIDEO_PRODUCTION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedWeddingEventTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Wedding Event",
      slug: "wedding-event",
      description: "Wedding planning, vendor coordination, ceremony readiness, and post-event tasks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Wedding Event",
        description:
          "Wedding planning, vendor coordination, ceremony readiness, and post-event tasks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for a Wedding Event Checklist",
      slug: "preparation-for-a-wedding-event-checklist",
      description:
        "A wedding event checklist covering planning, legal documents, venue, catering, media, attire, entertainment, guest experience, emergency prep, event start, and wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for a Wedding Event Checklist",
        description:
          "A wedding event checklist covering planning, legal documents, venue, catering, media, attire, entertainment, guest experience, emergency prep, event start, and wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of WEDDING_EVENT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedChildrensPartyTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Children's Party",
      slug: "childrens-party",
      description:
        "Children's party planning, venue setup, food, decorations, activities, safety, gifts, and cleanup.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Children's Party",
        description:
          "Children's party planning, venue setup, food, decorations, activities, safety, gifts, and cleanup.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Checklist for Organizing a Children's Party",
      slug: "checklist-for-organizing-a-childrens-party",
      description:
        "A children's party checklist covering planning, venue preparation, food and drinks, decorations, entertainment, safety, gifts, before guests arrive, during the party, and after-party cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Checklist for Organizing a Children's Party",
        description:
          "A children's party checklist covering planning, venue preparation, food and drinks, decorations, entertainment, safety, gifts, before guests arrive, during the party, and after-party cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CHILDRENS_PARTY_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedMusicalPerformanceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Musical Performance",
      slug: "musical-performance",
      description:
        "Musical performance planning, equipment setup, technical checks, stage readiness, performer preparation, and post-show wrap-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Musical Performance",
        description:
          "Musical performance planning, equipment setup, technical checks, stage readiness, performer preparation, and post-show wrap-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Checklist for a Musical Performance or Concert",
      slug: "checklist-for-a-musical-performance-or-concert",
      description:
        "A musical performance checklist covering planning, equipment, technical setup, materials, personal preparation, team communication, stage readiness, performance flow, and post-show wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Checklist for a Musical Performance or Concert",
        description:
          "A musical performance checklist covering planning, equipment, technical setup, materials, personal preparation, team communication, stage readiness, performance flow, and post-show wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of MUSICAL_PERFORMANCE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedPodcastRecordingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Photography and Media",
      slug: "photography-and-media",
      description: "Checklist templates for photography, video, and creative production work.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Photography and Media",
        description: "Checklist templates for photography, video, and creative production work.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Podcast Recording",
      slug: "podcast-recording",
      description:
        "Podcast episode planning, room setup, audio equipment, remote guest prep, recording workflow, and post-production wrap-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Podcast Recording",
        description:
          "Podcast episode planning, room setup, audio equipment, remote guest prep, recording workflow, and post-production wrap-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Podcast Recording Setup Checklist",
      slug: "podcast-recording-setup-checklist",
      description:
        "A podcast recording checklist covering episode planning, room setup, audio equipment, software, remote guests, branding, recording, and after-recording tasks.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Podcast Recording Setup Checklist",
        description:
          "A podcast recording checklist covering episode planning, room setup, audio equipment, software, remote guests, branding, recording, and after-recording tasks.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of PODCAST_RECORDING_SETUP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedPhotographyDroneMissionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Photography and Media",
      slug: "photography-and-media",
      description: "Checklist templates for photography, video, and creative production work.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Photography and Media",
        description: "Checklist templates for photography, video, and creative production work.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Photography Drone Mission",
      slug: "photography-drone-mission",
      description:
        "Drone photography mission planning, aircraft inspection, camera setup, environment checks, safety prep, flight execution, and post-flight wrap-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Photography Drone Mission",
        description:
          "Drone photography mission planning, aircraft inspection, camera setup, environment checks, safety prep, flight execution, and post-flight wrap-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Photography Drone Mission Checklist",
      slug: "photography-drone-mission-checklist",
      description:
        "A drone photography checklist covering mission planning, drone inspection, battery management, camera setup, environment assessment, communication, safety, takeoff, mission execution, and landing wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Photography Drone Mission Checklist",
        description:
          "A drone photography checklist covering mission planning, drone inspection, battery management, camera setup, environment assessment, communication, safety, takeoff, mission execution, and landing wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of PHOTOGRAPHY_DRONE_MISSION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedBusinessConferenceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Business Conference",
      slug: "business-conference",
      description:
        "Conference planning, speaker coordination, attendee management, event operations, and wrap-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Business Conference",
        description:
          "Conference planning, speaker coordination, attendee management, event operations, and wrap-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Organizing a Business Conference Checklist",
      slug: "organizing-a-business-conference-checklist",
      description:
        "A business conference checklist covering planning, venue logistics, speakers, registration, marketing, technology, hospitality, staffing, live operations, and post-event review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Organizing a Business Conference Checklist",
        description:
          "A business conference checklist covering planning, venue logistics, speakers, registration, marketing, technology, hospitality, staffing, live operations, and post-event review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of BUSINESS_CONFERENCE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedWorkshopTrainingEventTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Workshop / Training Event",
      slug: "workshop-training-event",
      description:
        "Workshop planning, trainer coordination, participant management, delivery, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Workshop / Training Event",
        description:
          "Workshop planning, trainer coordination, participant management, delivery, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Organizing a Workshop / Training Event Checklist",
      slug: "organizing-a-workshop-training-event-checklist",
      description:
        "A workshop and training event checklist covering planning, logistics, materials, trainers, registration, technology, hospitality, live delivery, and post-event follow-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Organizing a Workshop / Training Event Checklist",
        description:
          "A workshop and training event checklist covering planning, logistics, materials, trainers, registration, technology, hospitality, live delivery, and post-event follow-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of WORKSHOP_TRAINING_EVENT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOnlineWebinarTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Online Webinar",
      slug: "online-webinar",
      description: "Webinar planning, platform setup, presenter prep, delivery, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Online Webinar",
        description: "Webinar planning, platform setup, presenter prep, delivery, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for an Online Webinar Checklist",
      slug: "preparation-for-an-online-webinar-checklist",
      description:
        "An online webinar checklist covering planning, platform setup, presenter preparation, technical checks, marketing, webinar content, live moderation, and post-webinar follow-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for an Online Webinar Checklist",
        description:
          "An online webinar checklist covering planning, platform setup, presenter preparation, technical checks, marketing, webinar content, live moderation, and post-webinar follow-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of ONLINE_WEBINAR_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOfficeLaunchTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Business Operations",
      slug: "business-operations",
      description: "Checklist templates for workplace setup, operations, and business workflows.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Business Operations",
        description: "Checklist templates for workplace setup, operations, and business workflows.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Office Launch",
      slug: "office-launch",
      description:
        "Office launch planning, infrastructure, employee readiness, operations, safety, launch day, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Office Launch",
        description:
          "Office launch planning, infrastructure, employee readiness, operations, safety, launch day, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Launching a New Office Checklist",
      slug: "launching-a-new-office-checklist",
      description:
        "A new office launch checklist covering planning, office infrastructure, furniture, IT setup, employee readiness, administration, safety, opening day, and post-launch review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Launching a New Office Checklist",
        description:
          "A new office launch checklist covering planning, office infrastructure, furniture, IT setup, employee readiness, administration, safety, opening day, and post-launch review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of OFFICE_LAUNCH_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedMovingNewHomeTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Home and Moving",
      slug: "home-and-moving",
      description: "Checklist templates for moving, home setup, and household routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Home and Moving",
        description: "Checklist templates for moving, home setup, and household routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Moving Into a New Home",
      slug: "moving-into-a-new-home",
      description:
        "Moving planning, address updates, packing, utilities, move-in setup, safety, and settling in.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Moving Into a New Home",
        description:
          "Moving planning, address updates, packing, utilities, move-in setup, safety, and settling in.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Moving Into a New Home Checklist",
      slug: "moving-into-a-new-home-checklist",
      description:
        "A new-home moving checklist covering planning, administrative updates, packing, utilities, moving day, arrival, cleaning, safety, and post-move setup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Moving Into a New Home Checklist",
        description:
          "A new-home moving checklist covering planning, administrative updates, packing, utilities, moving day, arrival, cleaning, safety, and post-move setup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of MOVING_NEW_HOME_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedSpringCleaningHomeTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Home and Moving",
      slug: "home-and-moving",
      description: "Checklist templates for moving, home setup, and household routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Home and Moving",
        description: "Checklist templates for moving, home setup, and household routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Spring Cleaning and Maintenance at Home",
      slug: "spring-cleaning-and-maintenance-at-home",
      description:
        "Room-by-room spring cleaning, decluttering, maintenance, safety, and home organization checks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Spring Cleaning and Maintenance at Home",
        description:
          "Room-by-room spring cleaning, decluttering, maintenance, safety, and home organization checks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Spring Cleaning and Maintenance at Home Checklist",
      slug: "spring-cleaning-and-maintenance-at-home-checklist",
      description:
        "A spring cleaning checklist for the home covering planning, decluttering, living areas, kitchen, bathroom, bedrooms, laundry areas, outdoor maintenance, safety, and final organization.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Spring Cleaning and Maintenance at Home Checklist",
        description:
          "A spring cleaning checklist for the home covering planning, decluttering, living areas, kitchen, bathroom, bedrooms, laundry areas, outdoor maintenance, safety, and final organization.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of SPRING_CLEANING_HOME_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedWinterHomePreparationTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Home and Moving",
      slug: "home-and-moving",
      description: "Checklist templates for moving, home setup, and household routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Home and Moving",
        description: "Checklist templates for moving, home setup, and household routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Winter Home Preparation",
      slug: "winter-home-preparation",
      description:
        "Winterization, heating, plumbing, safety, exterior maintenance, and seasonal preparation for homes and vacation properties.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Winter Home Preparation",
        description:
          "Winterization, heating, plumbing, safety, exterior maintenance, and seasonal preparation for homes and vacation properties.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing a House or Vacation Home for Winter Checklist",
      slug: "preparing-a-house-or-vacation-home-for-winter-checklist",
      description:
        "A winter home preparation checklist covering planning, heating, plumbing, exterior maintenance, windows and doors, electrical and safety systems, interior prep, vacation-home steps, emergency preparedness, and seasonal monitoring.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing a House or Vacation Home for Winter Checklist",
        description:
          "A winter home preparation checklist covering planning, heating, plumbing, exterior maintenance, windows and doors, electrical and safety systems, interior prep, vacation-home steps, emergency preparedness, and seasonal monitoring.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of WINTER_HOME_PREPARATION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedRentalPropertyInspectionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Property Management",
      slug: "property-management",
      description: "Checklist templates for rental properties, inspections, and property operations.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Property Management",
        description:
          "Checklist templates for rental properties, inspections, and property operations.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Pre-Rental Property Inspection",
      slug: "pre-rental-property-inspection",
      description:
        "Property documentation, exterior, interior, utilities, safety, cleaning, and final rental-readiness checks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Pre-Rental Property Inspection",
        description:
          "Property documentation, exterior, interior, utilities, safety, cleaning, and final rental-readiness checks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Inspection Before Renting Out a Property Checklist",
      slug: "inspection-before-renting-out-a-property-checklist",
      description:
        "A pre-rental property inspection checklist covering documents, exterior and interior condition, electrical, plumbing, kitchen, bathroom, HVAC, safety, cleaning, and final review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Inspection Before Renting Out a Property Checklist",
        description:
          "A pre-rental property inspection checklist covering documents, exterior and interior condition, electrical, plumbing, kitchen, bathroom, HVAC, safety, cleaning, and final review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of RENTAL_PROPERTY_INSPECTION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedAirbnbGuestPreparationTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Property Management",
      slug: "property-management",
      description: "Checklist templates for rental properties, inspections, and property operations.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Property Management",
        description:
          "Checklist templates for rental properties, inspections, and property operations.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Airbnb Guest Preparation",
      slug: "airbnb-guest-preparation",
      description:
        "Short-term rental guest communication, cleaning, setup, safety, guest support, and turnover.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Airbnb Guest Preparation",
        description:
          "Short-term rental guest communication, cleaning, setup, safety, guest support, and turnover.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for an Airbnb Guest Checklist",
      slug: "preparing-for-an-airbnb-guest-checklist",
      description:
        "An Airbnb guest preparation checklist covering communication, cleaning, bedroom, bathroom, kitchen, safety, guest experience, arrival, stay support, and checkout turnover.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for an Airbnb Guest Checklist",
        description:
          "An Airbnb guest preparation checklist covering communication, cleaning, bedroom, bathroom, kitchen, safety, guest experience, arrival, stay support, and checkout turnover.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of AIRBNB_GUEST_PREPARATION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedCarServiceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      description: "Checklist templates for vehicle service, inspection, and travel readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Vehicle Maintenance",
        description: "Checklist templates for vehicle service, inspection, and travel readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Car Service",
      slug: "car-service",
      description:
        "Vehicle service planning, inspection, documentation, maintenance requests, service center visit, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Car Service",
        description:
          "Vehicle service planning, inspection, documentation, maintenance requests, service center visit, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Car Service Checklist",
      slug: "preparing-for-a-car-service-checklist",
      description:
        "A car service checklist covering appointment planning, vehicle inspection, documents, cleaning, maintenance requests, technology, service center communication, and post-service review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Car Service Checklist",
        description:
          "A car service checklist covering appointment planning, vehicle inspection, documents, cleaning, maintenance requests, technology, service center communication, and post-service review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CAR_SERVICE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedPreTripCarInspectionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      description: "Checklist templates for vehicle service, inspection, and travel readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Vehicle Maintenance",
        description: "Checklist templates for vehicle service, inspection, and travel readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Pre-Trip Car Inspection",
      slug: "pre-trip-car-inspection",
      description:
        "Technical vehicle checks before a road trip, including fluids, tires, brakes, lights, safety gear, documents, and in-trip monitoring.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Pre-Trip Car Inspection",
        description:
          "Technical vehicle checks before a road trip, including fluids, tires, brakes, lights, safety gear, documents, and in-trip monitoring.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Pre-Trip Technical Inspection of a Car Checklist",
      slug: "pre-trip-technical-inspection-of-a-car-checklist",
      description:
        "A pre-trip technical car inspection checklist covering engine fluids, tires, brakes, electrical systems, visibility, safety equipment, documents, departure checks, and in-trip monitoring.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Pre-Trip Technical Inspection of a Car Checklist",
        description:
          "A pre-trip technical car inspection checklist covering engine fluids, tires, brakes, electrical systems, visibility, safety equipment, documents, departure checks, and in-trip monitoring.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of PRE_TRIP_CAR_INSPECTION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOffRoadExpeditionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      description: "Checklist templates for vehicle service, inspection, and travel readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Vehicle Maintenance",
        description: "Checklist templates for vehicle service, inspection, and travel readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Off-Road Expedition",
      slug: "off-road-expedition",
      description:
        "Off-road route planning, vehicle preparation, recovery gear, navigation, survival supplies, expedition safety, and post-trip maintenance.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Off-Road Expedition",
        description:
          "Off-road route planning, vehicle preparation, recovery gear, navigation, survival supplies, expedition safety, and post-trip maintenance.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for an Off-Road Expedition Checklist",
      slug: "preparing-for-an-off-road-expedition-checklist",
      description:
        "An off-road expedition checklist covering route planning, vehicle prep, recovery equipment, navigation, camping supplies, safety, personal gear, departure, trip monitoring, and post-trip care.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for an Off-Road Expedition Checklist",
        description:
          "An off-road expedition checklist covering route planning, vehicle prep, recovery equipment, navigation, camping supplies, safety, personal gear, departure, trip monitoring, and post-trip care.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of OFF_ROAD_EXPEDITION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedCaravanCamperVanTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Road Travel",
      slug: "road-travel",
      description: "Checklist templates for road travel, vehicle readiness, and mobile camping routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Road Travel",
        description:
          "Checklist templates for road travel, vehicle readiness, and mobile camping routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Caravan / Camper Van Trip",
      slug: "caravan-camper-van-trip",
      description:
        "Caravan and camper van trip planning, vehicle inspection, onboard systems, camping gear, food, safety, connectivity, departure, travel monitoring, and post-trip cleanup.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Caravan / Camper Van Trip",
        description:
          "Caravan and camper van trip planning, vehicle inspection, onboard systems, camping gear, food, safety, connectivity, departure, travel monitoring, and post-trip cleanup.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Caravan / Camper Van Trip Checklist",
      slug: "preparing-for-a-caravan-camper-van-trip-checklist",
      description:
        "A caravan and camper van trip checklist covering route planning, vehicle inspection, systems checks, camping equipment, food, clothing, safety supplies, connectivity, departure, travel, and post-trip cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Caravan / Camper Van Trip Checklist",
        description:
          "A caravan and camper van trip checklist covering route planning, vehicle inspection, systems checks, camping equipment, food, clothing, safety supplies, connectivity, departure, travel, and post-trip cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CARAVAN_CAMPER_VAN_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedBoatYachtTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Boating",
      slug: "boating",
      description: "Checklist templates for boat and yacht travel, vessel prep, and marine safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Boating",
        description:
          "Checklist templates for boat and yacht travel, vessel prep, and marine safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Boat / Yacht Trip",
      slug: "boat-yacht-trip",
      description:
        "Boat and yacht trip planning, vessel inspection, safety gear, navigation, food, clothing, recreation, departure, trip monitoring, and post-trip cleanup.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Boat / Yacht Trip",
        description:
          "Boat and yacht trip planning, vessel inspection, safety gear, navigation, food, clothing, recreation, departure, trip monitoring, and post-trip cleanup.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Boat / Yacht Trip Checklist",
      slug: "preparing-for-a-boat-yacht-trip-checklist",
      description:
        "A boat and yacht trip checklist covering planning, vessel inspection, safety equipment, navigation, food, clothing, recreation, departure, trip monitoring, and post-trip cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Boat / Yacht Trip Checklist",
        description:
          "A boat and yacht trip checklist covering planning, vessel inspection, safety equipment, navigation, food, clothing, recreation, departure, trip monitoring, and post-trip cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of BOAT_YACHT_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedEmergencyDisasterPreparednessTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Safety",
      slug: "safety",
      description: "Checklist templates for emergency readiness, home safety, and personal protection.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Safety",
        description:
          "Checklist templates for emergency readiness, home safety, and personal protection.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Emergency / Disaster Preparedness",
      slug: "emergency-disaster-preparedness",
      description:
        "Emergency planning, supply kits, documents, home safety, communication, food and water, medical needs, vehicle readiness, evacuation, emergency response, and recovery.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Emergency / Disaster Preparedness",
        description:
          "Emergency planning, supply kits, documents, home safety, communication, food and water, medical needs, vehicle readiness, evacuation, emergency response, and recovery.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Emergency / Disaster Preparedness Checklist",
      slug: "emergency-disaster-preparedness-checklist",
      description:
        "An emergency preparedness checklist covering family planning, supply kits, documents, home safety, communication, food and water, medical needs, vehicle readiness, evacuation, emergency response, and recovery.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Emergency / Disaster Preparedness Checklist",
        description:
          "An emergency preparedness checklist covering family planning, supply kits, documents, home safety, communication, food and water, medical needs, vehicle readiness, evacuation, emergency response, and recovery.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of EMERGENCY_DISASTER_PREPAREDNESS_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedFirstDayOfSchoolTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Education",
      slug: "education",
      description: "Checklist templates for school preparation, learning routines, and academic planning",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Education",
        description:
          "Checklist templates for school preparation, learning routines, and academic planning",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "School Preparation",
      slug: "school-preparation",
      description:
        "First day of school planning, supplies, clothing, health, transportation, academic, emotional, morning, and after-school preparation.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "School Preparation",
        description:
          "First day of school planning, supplies, clothing, health, transportation, academic, emotional, morning, and after-school preparation.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for the First Day of School Checklist",
      slug: "preparing-for-the-first-day-of-school-checklist",
      description:
        "A first day of school checklist covering school setup, supplies, clothing, health, transportation, academic preparation, emotional readiness, the night before, morning of, and after school.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for the First Day of School Checklist",
        description:
          "A first day of school checklist covering school setup, supplies, clothing, health, transportation, academic preparation, emotional readiness, the night before, morning of, and after school.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of FIRST_DAY_OF_SCHOOL_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedExamOrCertificationTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Education",
      slug: "education",
      description: "Checklist templates for school preparation, learning routines, and academic planning",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Education",
        description:
          "Checklist templates for school preparation, learning routines, and academic planning",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Exam Preparation",
      slug: "exam-preparation",
      description:
        "Exam and certification planning, study materials, practice, technology, health, documents, day-before, exam-day, during-exam, and after-exam preparation.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Exam Preparation",
        description:
          "Exam and certification planning, study materials, practice, technology, health, documents, day-before, exam-day, during-exam, and after-exam preparation.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for an Exam or Certification Checklist",
      slug: "preparing-for-an-exam-or-certification-checklist",
      description:
        "An exam preparation checklist covering planning, study materials, study routine, technology, health, documents, the day before, exam day, during the exam, and after the exam.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for an Exam or Certification Checklist",
        description:
          "An exam preparation checklist covering planning, study materials, study routine, technology, health, documents, the day before, exam day, during the exam, and after the exam.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of EXAM_OR_CERTIFICATION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOnboardingNewEmployeeTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Human Resources",
      slug: "human-resources",
      description: "Checklist templates for onboarding, people operations, and workplace administration.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Human Resources",
        description:
          "Checklist templates for onboarding, people operations, and workplace administration.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Employee Onboarding",
      slug: "employee-onboarding",
      description:
        "New employee onboarding, IT setup, workspace preparation, HR tasks, team introductions, training, security, first-day prep, first-week support, and onboarding completion.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Employee Onboarding",
        description:
          "New employee onboarding, IT setup, workspace preparation, HR tasks, team introductions, training, security, first-day prep, first-week support, and onboarding completion.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Onboarding Checklist for a New Employee",
      slug: "onboarding-checklist-for-a-new-employee",
      description:
        "A new employee onboarding checklist covering pre-onboarding preparation, IT setup, workspace readiness, HR tasks, team communication, training, security, first-day prep, first-week support, and completion.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Onboarding Checklist for a New Employee",
        description:
          "A new employee onboarding checklist covering pre-onboarding preparation, IT setup, workspace readiness, HR tasks, team communication, training, security, first-day prep, first-week support, and completion.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of ONBOARDING_NEW_EMPLOYEE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOffboardingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Human Resources",
      slug: "human-resources",
      description: "Checklist templates for onboarding, offboarding, and workplace administration.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Human Resources",
        description:
          "Checklist templates for onboarding, offboarding, and workplace administration.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Employee Offboarding",
      slug: "employee-offboarding",
      description:
        "Employee departure planning, HR tasks, IT access removal, equipment return, handover, communication, compliance, exit interview, final day, and post-offboarding review.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Employee Offboarding",
        description:
          "Employee departure planning, HR tasks, IT access removal, equipment return, handover, communication, compliance, exit interview, final day, and post-offboarding review.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Offboarding Checklist When an Employee Leaves",
      slug: "offboarding-checklist-when-an-employee-leaves",
      description:
        "An offboarding checklist covering planning, HR tasks, IT access removal, asset return, handover, communication, compliance, exit interview, final day procedures, and after-offboarding follow-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Offboarding Checklist When an Employee Leaves",
        description:
          "An offboarding checklist covering planning, HR tasks, IT access removal, asset return, handover, communication, compliance, exit interview, final day procedures, and after-offboarding follow-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of OFFBOARDING_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedReleaseDeploymentTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Software Development",
      slug: "software-development",
      description: "Checklist templates for software releases, engineering workflows, and product deployment.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Software Development",
        description:
          "Checklist templates for software releases, engineering workflows, and product deployment.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Release Deployment",
      slug: "release-deployment",
      description:
        "Release planning, code preparation, testing, backend, infrastructure, frontend, mobile, security, deployment, verification, rollback, and communication checks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Release Deployment",
        description:
          "Release planning, code preparation, testing, backend, infrastructure, frontend, mobile, security, deployment, verification, rollback, and communication checks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Release Checklist for Software Deployment",
      slug: "release-checklist-for-software-deployment",
      description:
        "A software deployment release checklist covering planning, repository prep, testing, backend, infrastructure, frontend, mobile, security, execution, verification, rollback, and communication.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Release Checklist for Software Deployment",
        description:
          "A software deployment release checklist covering planning, repository prep, testing, backend, infrastructure, frontend, mobile, security, execution, verification, rollback, and communication.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of RELEASE_DEPLOYMENT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedQASoftwareTestingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Quality Assurance",
      slug: "quality-assurance",
      description: "Checklist templates for QA, software testing, validation, and release readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Quality Assurance",
        description:
          "Checklist templates for QA, software testing, validation, and release readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Software Testing",
      slug: "software-testing",
      description:
        "Testing planning, environment setup, functional, UI/UX, API, database, security, performance, compatibility, mobile, regression, release, and bug reporting checks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Software Testing",
        description:
          "Testing planning, environment setup, functional, UI/UX, API, database, security, performance, compatibility, mobile, regression, release, and bug reporting checks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "QA / Software Testing Checklist",
      slug: "qa-software-testing-checklist",
      description:
        "A QA and software testing checklist covering planning, environment setup, functional testing, UI/UX, API, database, security, performance, compatibility, mobile, regression, pre-release, and bug reporting.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "QA / Software Testing Checklist",
        description:
          "A QA and software testing checklist covering planning, environment setup, functional testing, UI/UX, API, database, security, performance, compatibility, mobile, regression, pre-release, and bug reporting.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of QA_SOFTWARE_TESTING_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedDailyOpeningRestaurantTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Food Service",
      slug: "food-service",
      description: "Checklist templates for restaurants, cafés, kitchens, and hospitality operations.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Food Service",
        description:
          "Checklist templates for restaurants, cafés, kitchens, and hospitality operations.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Restaurant Opening",
      slug: "restaurant-opening",
      description:
        "Opening, setup, safety, inventory, and service-readiness checks for restaurants and cafés.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Restaurant Opening",
        description:
          "Opening, setup, safety, inventory, and service-readiness checks for restaurants and cafés.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Daily Opening Checklist for a Restaurant / Café",
      slug: "daily-opening-checklist-for-a-restaurant-cafe",
      description:
        "A daily opening checklist for restaurants and cafés covering staff prep, exterior checks, dining area setup, kitchen prep, beverages, POS systems, safety, inventory, opening walkthrough, service readiness, and post-opening review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Daily Opening Checklist for a Restaurant / Café",
        description:
          "A daily opening checklist for restaurants and cafés covering staff prep, exterior checks, dining area setup, kitchen prep, beverages, POS systems, safety, inventory, opening walkthrough, service readiness, and post-opening review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of DAILY_OPENING_RESTAURANT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedClosingStoreTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Retail Operations",
      slug: "retail-operations",
      description: "Checklist templates for store operations, retail closing, and customer-facing businesses.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Retail Operations",
        description:
          "Checklist templates for store operations, retail closing, and customer-facing businesses.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Store Closing",
      slug: "store-closing",
      description:
        "Closing procedures, cash handling, cleaning, inventory, shutdown, safety, staff responsibilities, and final walkthrough checks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Store Closing",
        description:
          "Closing procedures, cash handling, cleaning, inventory, shutdown, safety, staff responsibilities, and final walkthrough checks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Closing Checklist for a Store or Establishment",
      slug: "closing-checklist-for-a-store-or-establishment",
      description:
        "A store closing checklist covering customer service, cash handling, cleaning, inventory, technology shutdown, safety, staff responsibilities, exterior inspection, and the final walkthrough.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Closing Checklist for a Store or Establishment",
        description:
          "A store closing checklist covering customer service, cash handling, cleaning, inventory, technology shutdown, safety, staff responsibilities, exterior inspection, and the final walkthrough.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CLOSING_STORE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedFishingTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Fishing Trip",
      slug: "fishing-trip",
      description:
        "Fishing trip planning, gear, water safety, personal supplies, navigation, emergency prep, and cleanup.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Fishing Trip",
        description:
          "Fishing trip planning, gear, water safety, personal supplies, navigation, emergency prep, and cleanup.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Fishing Trip Checklist",
      slug: "preparing-for-a-fishing-trip-checklist",
      description:
        "A fishing trip checklist covering planning, fishing gear, boat safety, clothing, food, navigation, emergency supplies, departure, trip conduct, and post-trip cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Fishing Trip Checklist",
        description:
          "A fishing trip checklist covering planning, fishing gear, boat safety, clothing, food, navigation, emergency supplies, departure, trip conduct, and post-trip cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of FISHING_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedHuntingTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Hunting",
      slug: "hunting",
      description: "Checklist templates for hunting trips and related outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Hunting",
        description: "Checklist templates for hunting trips and related outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Hunting Trip",
      slug: "hunting-trip",
      description:
        "Hunting trip planning, firearms and equipment, safety gear, clothing, navigation, camping supplies, departure, field conduct, and post-trip cleanup.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Hunting Trip",
        description:
          "Hunting trip planning, firearms and equipment, safety gear, clothing, navigation, camping supplies, departure, field conduct, and post-trip cleanup.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Hunting Trip Checklist",
      slug: "preparing-for-a-hunting-trip-checklist",
      description:
        "A hunting trip checklist covering planning, firearms and equipment, safety gear, clothing, food, navigation, camping supplies, departure, trip conduct, and post-trip cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Hunting Trip Checklist",
        description:
          "A hunting trip checklist covering planning, firearms and equipment, safety gear, clothing, food, navigation, camping supplies, departure, trip conduct, and post-trip cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of HUNTING_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function main() {
  await seedSampleUsers();

  const existingScubaTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "scuba-diving-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingScubaTemplate && existingScubaTemplate.sections.length > 0) {
    console.log("Scuba diving preparation checklist seed already exists.");
  } else {
    const template = await seedScubaDivingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingDroneTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "drone-operator-pre-flight-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingDroneTemplate && existingDroneTemplate.sections.length > 0) {
    console.log("Drone pre-flight preparation checklist seed already exists.");
  } else {
    const template = await seedDronePreflightTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingTravelTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-international-travel-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingTravelTemplate && existingTravelTemplate.sections.length > 0) {
    console.log("International travel preparation checklist seed already exists.");
  } else {
    const template = await seedInternationalTravelTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingCampingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "camping-and-hiking-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingCampingTemplate && existingCampingTemplate.sections.length > 0) {
    console.log("Camping and hiking checklist seed already exists.");
  } else {
    const template = await seedCampingHikingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingHikingSafetyTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "hiking-safety-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingHikingSafetyTemplate && existingHikingSafetyTemplate.sections.length > 0) {
    console.log("Hiking safety checklist seed already exists.");
  } else {
    const template = await seedHikingSafetyTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingTentCampingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "organizing-a-camping-trip-with-a-tent-checklist"),
    with: {
      sections: true,
    },
  });

const STARTUP_LAUNCH_CHECKLIST = [
  {
    title: "Business Planning",
    items: [
      "Define startup mission and vision",
      "Identify target audience and customer segments",
      "Validate business idea and market demand",
      "Research competitors and industry trends",
      "Define unique value proposition",
      "Create business model and revenue strategy",
      "Prepare business plan and financial projections",
      "Set short-term and long-term goals",
      "Identify key performance indicators (KPIs)",
      "Prepare risk management and contingency plans",
    ],
  },
  {
    title: "Legal and Administrative Setup",
    items: [
      "Register business entity",
      "Obtain required licenses and permits",
      "Register business name and trademarks if needed",
      "Open business bank account",
      "Set up accounting and bookkeeping systems",
      "Prepare contracts and legal documents",
      "Review tax obligations and requirements",
      "Obtain business insurance",
      "Draft privacy policy and terms of service",
      "Ensure compliance with local regulations",
    ],
  },
  {
    title: "Financial Preparation",
    items: [
      "Define startup budget",
      "Secure funding or investment if needed",
      "Prepare cash flow projections",
      "Set pricing strategy",
      "Establish payment processing systems",
      "Create expense tracking process",
      "Prepare financial reporting procedures",
      "Set up payroll system if hiring employees",
      "Build emergency financial reserve",
      "Review financial risks and runway",
    ],
  },
  {
    title: "Product or Service Preparation",
    items: [
      "Finalize product or service offering",
      "Complete MVP or product development",
      "Conduct product testing and QA",
      "Gather user feedback before launch",
      "Fix critical bugs or issues",
      "Prepare onboarding or user documentation",
      "Define customer support process",
      "Set up analytics and tracking tools",
      "Verify scalability and infrastructure readiness",
      "Create backup and recovery plans",
    ],
  },
  {
    title: "Branding and Marketing",
    items: [
      "Finalize company name and branding",
      "Design logo and visual identity",
      "Build company website or landing page",
      "Create social media accounts",
      "Prepare marketing content and assets",
      "Develop launch marketing strategy",
      "Create email marketing setup",
      "Prepare press kit and media materials",
      "Build customer acquisition funnel",
      "Plan promotional campaigns and launch announcements",
    ],
  },
  {
    title: "Sales and Customer Support",
    items: [
      "Define sales process and workflow",
      "Prepare pricing pages and offers",
      "Set up CRM or customer management tools",
      "Create customer support channels",
      "Prepare FAQ and help documentation",
      "Define refund and cancellation policies",
      "Train support or sales team if applicable",
      "Prepare onboarding flow for customers",
      "Set response time and support expectations",
      "Test customer communication systems",
    ],
  },
  {
    title: "Team and Operations",
    items: [
      "Define team roles and responsibilities",
      "Hire or onboard key team members",
      "Set up internal communication tools",
      "Create project management workflows",
      "Establish company processes and policies",
      "Prepare onboarding materials for employees",
      "Schedule regular team meetings",
      "Define reporting and accountability systems",
      "Review remote or office work setup",
      "Build company culture guidelines",
    ],
  },
  {
    title: "Technology and Infrastructure",
    items: [
      "Set up hosting and domain configuration",
      "Verify website and application performance",
      "Configure databases and backups",
      "Set up monitoring and alert systems",
      "Test APIs and integrations",
      "Verify security and access controls",
      "Configure analytics and tracking tools",
      "Prepare deployment and rollback procedures",
      "Ensure SSL certificates and HTTPS are active",
      "Test mobile responsiveness and compatibility",
    ],
  },
  {
    title: "Security and Compliance",
    items: [
      "Implement cybersecurity best practices",
      "Verify user authentication systems",
      "Protect customer and business data",
      "Configure backups and disaster recovery",
      "Test vulnerability and security measures",
      "Review GDPR/privacy compliance if applicable",
      "Ensure secure payment processing",
      "Verify access permissions and roles",
      "Monitor for suspicious activity",
      "Prepare incident response procedures",
    ],
  },
  {
    title: "Launch Readiness",
    items: [
      "Conduct final product testing",
      "Review all website pages and links",
      "Verify payment systems work correctly",
      "Test signup and onboarding flow",
      "Confirm customer support readiness",
      "Prepare launch-day communication plan",
      "Review analytics dashboards",
      "Conduct team launch rehearsal if needed",
      "Ensure servers and systems can handle traffic",
      "Approve final launch checklist",
    ],
  },
  {
    title: "Launch Day",
    items: [
      "Announce launch publicly",
      "Monitor website and application performance",
      "Respond to customer questions quickly",
      "Monitor marketing campaign performance",
      "Track signups, sales, and traffic",
      "Watch for technical issues or downtime",
      "Coordinate team communication actively",
      "Gather early customer feedback",
      "Record launch-day metrics and observations",
      "Celebrate successful launch with team",
    ],
  },
  {
    title: "Post-Launch Activities",
    items: [
      "Monitor user behavior and analytics",
      "Collect customer feedback and reviews",
      "Fix bugs and optimize performance",
      "Continue marketing and growth campaigns",
      "Analyze sales and conversion metrics",
      "Review financial performance",
      "Improve onboarding and retention flows",
      "Plan future features or improvements",
      "Conduct post-launch review meeting",
      "Update roadmap and business goals",
    ],
  },
] as const;

async function seedStartupLaunchTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Business",
      slug: "business",
      description: "Checklist templates for business planning and startup launches.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Business",
        description: "Checklist templates for business planning and startup launches.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Startup Launch",
      slug: "startup-launch",
      description: "Checklist for launching a startup or new business.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Startup Launch",
        description: "Checklist for launching a startup or new business.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Startup Launch Checklist",
      slug: "startup-launch-checklist",
      description: "Comprehensive checklist to prepare for a startup launch.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Startup Launch Checklist",
        description: "Comprehensive checklist to prepare for a startup launch.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of STARTUP_LAUNCH_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

  if (existingTentCampingTemplate && existingTentCampingTemplate.sections.length > 0) {
    console.log("Tent camping trip checklist seed already exists.");
  } else {
    const template = await seedTentCampingTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingRoadTripTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-a-road-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingRoadTripTemplate && existingRoadTripTemplate.sections.length > 0) {
    console.log("Road trip preparation checklist seed already exists.");
  } else {
    const template = await seedRoadTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingMotorcycleTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "motorcycle-trip-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingMotorcycleTemplate && existingMotorcycleTemplate.sections.length > 0) {
    console.log("Motorcycle trip preparation checklist seed already exists.");
  } else {
    const template = await seedMotorcycleTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingBicycleRaceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "bicycle-race-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingBicycleRaceTemplate && existingBicycleRaceTemplate.sections.length > 0) {
    console.log("Bicycle race preparation checklist seed already exists.");
  } else {
    const template = await seedBicycleRaceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingFitnessCompetitionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "fitness-competition-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingFitnessCompetitionTemplate && existingFitnessCompetitionTemplate.sections.length > 0) {
    console.log("Fitness competition preparation checklist seed already exists.");
  } else {
    const template = await seedFitnessCompetitionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingWeeklyMealPrepTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "weekly-meal-prep-planning-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingWeeklyMealPrepTemplate && existingWeeklyMealPrepTemplate.sections.length > 0) {
    console.log("Weekly meal prep planning checklist seed already exists.");
  } else {
    const template = await seedWeeklyMealPrepTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingHomeRenovationTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "home-renovation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingHomeRenovationTemplate && existingHomeRenovationTemplate.sections.length > 0) {
    console.log("Home renovation checklist seed already exists.");
  } else {
    const template = await seedHomeRenovationTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingCybersecurityTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "cybersecurity-audit-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingCybersecurityTemplate && existingCybersecurityTemplate.sections.length > 0) {
    console.log("Cybersecurity audit checklist seed already exists.");
  } else {
    const template = await seedCybersecurityAuditTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingServerMaintenanceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "server-maintenance-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingServerMaintenanceTemplate && existingServerMaintenanceTemplate.sections.length > 0) {
    console.log("Server maintenance checklist seed already exists.");
  } else {
    const template = await seedServerMaintenanceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingBackupVerificationTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "data-backup-verification-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingBackupVerificationTemplate && existingBackupVerificationTemplate.sections.length > 0) {
    console.log("Data backup verification checklist seed already exists.");
  } else {
    const template = await seedDataBackupVerificationTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingPhotoShootTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-a-photo-shoot-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingPhotoShootTemplate && existingPhotoShootTemplate.sections.length > 0) {
    console.log("Photo shoot preparation checklist seed already exists.");
  } else {
    const template = await seedPhotoShootTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingVideoProductionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-video-production-filming-day-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingVideoProductionTemplate && existingVideoProductionTemplate.sections.length > 0) {
    console.log("Video production preparation checklist seed already exists.");
  } else {
    const template = await seedVideoProductionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingWeddingEventTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-a-wedding-event-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingWeddingEventTemplate && existingWeddingEventTemplate.sections.length > 0) {
    console.log("Wedding event preparation checklist seed already exists.");
  } else {
    const template = await seedWeddingEventTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingChildrensPartyTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "checklist-for-organizing-a-childrens-party"),
    with: {
      sections: true,
    },
  });

  if (existingChildrensPartyTemplate && existingChildrensPartyTemplate.sections.length > 0) {
    console.log("Children's party checklist seed already exists.");
  } else {
    const template = await seedChildrensPartyTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingMusicalPerformanceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "checklist-for-a-musical-performance-or-concert"),
    with: {
      sections: true,
    },
  });

  if (existingMusicalPerformanceTemplate && existingMusicalPerformanceTemplate.sections.length > 0) {
    console.log("Musical performance checklist seed already exists.");
  } else {
    const template = await seedMusicalPerformanceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingPodcastRecordingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "podcast-recording-setup-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingPodcastRecordingTemplate && existingPodcastRecordingTemplate.sections.length > 0) {
    console.log("Podcast recording setup checklist seed already exists.");
  } else {
    const template = await seedPodcastRecordingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingPhotographyDroneMissionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "photography-drone-mission-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingPhotographyDroneMissionTemplate &&
    existingPhotographyDroneMissionTemplate.sections.length > 0
  ) {
    console.log("Photography drone mission checklist seed already exists.");
  } else {
    const template = await seedPhotographyDroneMissionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingBusinessConferenceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "organizing-a-business-conference-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingBusinessConferenceTemplate && existingBusinessConferenceTemplate.sections.length > 0) {
    console.log("Business conference checklist seed already exists.");
  } else {
    const template = await seedBusinessConferenceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingWorkshopTrainingEventTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "organizing-a-workshop-training-event-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingWorkshopTrainingEventTemplate &&
    existingWorkshopTrainingEventTemplate.sections.length > 0
  ) {
    console.log("Workshop/training event checklist seed already exists.");
  } else {
    const template = await seedWorkshopTrainingEventTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOnlineWebinarTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-an-online-webinar-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingOnlineWebinarTemplate && existingOnlineWebinarTemplate.sections.length > 0) {
    console.log("Online webinar preparation checklist seed already exists.");
  } else {
    const template = await seedOnlineWebinarTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOfficeLaunchTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "launching-a-new-office-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingOfficeLaunchTemplate && existingOfficeLaunchTemplate.sections.length > 0) {
    console.log("Office launch checklist seed already exists.");
  } else {
    const template = await seedOfficeLaunchTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingStartupLaunchTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "startup-launch-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingStartupLaunchTemplate && existingStartupLaunchTemplate.sections.length > 0) {
    console.log("Startup launch checklist seed already exists.");
  } else {
    const template = await seedStartupLaunchTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingMovingNewHomeTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "moving-into-a-new-home-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingMovingNewHomeTemplate && existingMovingNewHomeTemplate.sections.length > 0) {
    console.log("Moving into a new home checklist seed already exists.");
  } else {
    const template = await seedMovingNewHomeTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingSpringCleaningHomeTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "spring-cleaning-and-maintenance-at-home-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingSpringCleaningHomeTemplate &&
    existingSpringCleaningHomeTemplate.sections.length > 0
  ) {
    console.log("Spring cleaning and maintenance at home checklist seed already exists.");
  } else {
    const template = await seedSpringCleaningHomeTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingFirstAidTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "first-aid-kit-inspection-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingFirstAidTemplate && existingFirstAidTemplate.sections.length > 0) {
    console.log("First aid kit inspection checklist seed already exists.");
  } else {
    const template = await seedFirstAidKitTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingWinterHomeTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-a-house-or-vacation-home-for-winter-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingWinterHomeTemplate && existingWinterHomeTemplate.sections.length > 0) {
    console.log("Winter home preparation checklist seed already exists.");
  } else {
    const template = await seedWinterHomePreparationTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingRentalPropertyInspectionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "inspection-before-renting-out-a-property-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingRentalPropertyInspectionTemplate &&
    existingRentalPropertyInspectionTemplate.sections.length > 0
  ) {
    console.log("Pre-rental property inspection checklist seed already exists.");
  } else {
    const template = await seedRentalPropertyInspectionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingAirbnbGuestPreparationTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-an-airbnb-guest-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingAirbnbGuestPreparationTemplate &&
    existingAirbnbGuestPreparationTemplate.sections.length > 0
  ) {
    console.log("Airbnb guest preparation checklist seed already exists.");
  } else {
    const template = await seedAirbnbGuestPreparationTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingCarServiceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-car-service-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingCarServiceTemplate && existingCarServiceTemplate.sections.length > 0) {
    console.log("Car service preparation checklist seed already exists.");
  } else {
    const template = await seedCarServiceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingPreTripCarInspectionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "pre-trip-technical-inspection-of-a-car-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingPreTripCarInspectionTemplate &&
    existingPreTripCarInspectionTemplate.sections.length > 0
  ) {
    console.log("Pre-trip technical car inspection checklist seed already exists.");
  } else {
    const template = await seedPreTripCarInspectionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOffRoadExpeditionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-an-off-road-expedition-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingOffRoadExpeditionTemplate && existingOffRoadExpeditionTemplate.sections.length > 0) {
    console.log("Off-road expedition preparation checklist seed already exists.");
  } else {
    const template = await seedOffRoadExpeditionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingFishingTripTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-fishing-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingFishingTripTemplate && existingFishingTripTemplate.sections.length > 0) {
    console.log("Fishing trip preparation checklist seed already exists.");
  } else {
    const template = await seedFishingTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingCaravanCamperVanTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-caravan-camper-van-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingCaravanCamperVanTemplate && existingCaravanCamperVanTemplate.sections.length > 0) {
    console.log("Caravan / camper van trip checklist seed already exists.");
  } else {
    const template = await seedCaravanCamperVanTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingBoatYachtTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-boat-yacht-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingBoatYachtTemplate && existingBoatYachtTemplate.sections.length > 0) {
    console.log("Boat / yacht trip checklist seed already exists.");
  } else {
    const template = await seedBoatYachtTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingEmergencyDisasterTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "emergency-disaster-preparedness-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingEmergencyDisasterTemplate && existingEmergencyDisasterTemplate.sections.length > 0) {
    console.log("Emergency / disaster preparedness checklist seed already exists.");
  } else {
    const template = await seedEmergencyDisasterPreparednessTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingFirstDayOfSchoolTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-the-first-day-of-school-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingFirstDayOfSchoolTemplate && existingFirstDayOfSchoolTemplate.sections.length > 0) {
    console.log("First day of school checklist seed already exists.");
  } else {
    const template = await seedFirstDayOfSchoolTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingExamTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-an-exam-or-certification-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingExamTemplate && existingExamTemplate.sections.length > 0) {
    console.log("Exam or certification checklist seed already exists.");
  } else {
    const template = await seedExamOrCertificationTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOnboardingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "onboarding-checklist-for-a-new-employee"),
    with: {
      sections: true,
    },
  });

  if (existingOnboardingTemplate && existingOnboardingTemplate.sections.length > 0) {
    console.log("New employee onboarding checklist seed already exists.");
  } else {
    const template = await seedOnboardingNewEmployeeTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOffboardingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "offboarding-checklist-when-an-employee-leaves"),
    with: {
      sections: true,
    },
  });

  if (existingOffboardingTemplate && existingOffboardingTemplate.sections.length > 0) {
    console.log("Offboarding checklist seed already exists.");
  } else {
    const template = await seedOffboardingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingReleaseTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "release-checklist-for-software-deployment"),
    with: {
      sections: true,
    },
  });

  if (existingReleaseTemplate && existingReleaseTemplate.sections.length > 0) {
    console.log("Release checklist for software deployment seed already exists.");
  } else {
    const template = await seedReleaseDeploymentTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingQATemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "qa-software-testing-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingQATemplate && existingQATemplate.sections.length > 0) {
    console.log("QA / software testing checklist seed already exists.");
  } else {
    const template = await seedQASoftwareTestingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingRestaurantTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "daily-opening-checklist-for-a-restaurant-cafe"),
    with: {
      sections: true,
    },
  });

  if (existingRestaurantTemplate && existingRestaurantTemplate.sections.length > 0) {
    console.log("Daily opening checklist for a restaurant / café seed already exists.");
  } else {
    const template = await seedDailyOpeningRestaurantTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingClosingStoreTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "closing-checklist-for-a-store-or-establishment"),
    with: {
      sections: true,
    },
  });

  if (existingClosingStoreTemplate && existingClosingStoreTemplate.sections.length > 0) {
    console.log("Closing checklist for a store or establishment seed already exists.");
  } else {
    const template = await seedClosingStoreTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingGymTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "gym-opening-closing-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingGymTemplate && existingGymTemplate.sections.length > 0) {
    console.log("Gym opening / closing checklist seed already exists.");
  } else {
    const template = await seedGymOpeningClosingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingHuntingTripTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-hunting-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingHuntingTripTemplate && existingHuntingTripTemplate.sections.length > 0) {
    console.log("Hunting trip preparation checklist seed already exists.");
  } else {
    const template = await seedHuntingTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
