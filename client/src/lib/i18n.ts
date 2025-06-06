// Internationalization utilities
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

export interface Translations {
  [key: string]: string | Translations;
}

// Default translations (English)
export const translations: Record<LanguageCode, Translations> = {
  en: {    common: {
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      saving: 'Saving...',
      saveChanges: 'Save Changes',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      search: 'Search...'
    },navigation: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      projects: 'Projects',
      documents: 'Documents',
      team: 'Team',
      analytics: 'Analytics',
      settings: 'Settings'
    },    navbar: {
      notifications: 'Notifications',
      noNotifications: 'No new notifications',
      myAccount: 'My Account',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout'
    },
    dashboard: {
      welcomeMessage: "Welcome back, here's an overview of your projects",
      totalProjects: 'Total Projects',
      totalTasks: 'Total Tasks',
      teamMembers: 'Team Members',
      upcomingDeadlines: 'Upcoming Deadlines',
      tasksInNext7Days: 'Tasks due in the next 7 days',
      noTasksYet: 'No Tasks Yet',
      createFirstTask: 'Create your first task to see task analytics and distribution charts here.',
      getStartedTitle: 'Get Started with Your First Project',
      getStartedDescription: 'Create your first project to start managing tasks, documents, team members, and more.',
      createFirstProject: 'Create Your First Project'
    },
    tasks: {
      status: {
        todo: 'To Do',
        inProgress: 'In Progress',
        inReview: 'In Review',
        done: 'Done'
      },
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      }
    },    settings: {
      profile: {
        title: 'Profile',
        information: 'Profile Information',
        informationDescription: 'Update your profile information visible to other team members',
        nickname: 'Nickname',
        nicknamePlaceholder: 'Enter your nickname',
        email: 'Email',
        emailNote: 'Email cannot be changed',
        avatarUrl: 'Avatar URL',
        avatarPlaceholder: 'Enter avatar URL',
        language: 'Language',
        languagePlaceholder: 'Select a language',
        changeAvatar: 'Change Avatar',
        loading: 'Loading profile...'
      },
      notifications: {
        title: 'Notifications',
        preferences: 'Notification Preferences',
        preferencesDescription: 'Control how and when you receive notifications',
        emailNotifications: 'Email Notifications',
        emailNotificationsDescription: 'Receive notifications via email',
        taskNotifications: 'Task Notifications',
        taskAssignments: 'Task assignments',
        taskUpdates: 'Task updates and status changes',
        projectNotifications: 'Project Notifications',
        projectUpdates: 'Project updates and milestones',
        teamCommunications: 'Team Communications',
        teamMessages: 'Team messages and mentions',
        weeklyDigest: 'Weekly activity digest'
      },      security: {
        title: 'Security',
        settings: 'Security Settings',
        securitySettings: 'Security Settings',
        settingsDescription: 'Manage your account security and login preferences',
        securitySettingsDescription: 'Manage your account security and login preferences',
        twoFactorAuth: 'Two-Factor Authentication',
        twoFactorDescription: 'Add an extra layer of security to your account',
        setUp: 'Set Up',
        password: 'Password',
        changePassword: 'Change Password',
        loginSessions: 'Login Sessions',
        currentSession: 'Current Session',
        lastActive: 'Last active: Just now',
        current: 'Current'
      },
      appearance: {
        title: 'Appearance',
        settings: 'Appearance',
        settingsDescription: 'Customize your interface preferences',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        systemThemeDescription: 'Currently using {theme} theme based on system preference',
        currentlyUsing: 'Currently using {theme} theme',
        density: 'Density',
        densityCompact: 'Compact - More content, less spacing',
        densityComfortable: 'Comfortable - Balanced spacing',
        densitySpacious: 'Spacious - More breathing room',
        defaultView: 'Default View',
        kanbanBoard: 'Kanban Board',
        ganttChart: 'Gantt Chart',
        listView: 'List View'
      }},
    languages: {
      english: 'English',
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
      italian: 'Italian',
      portuguese: 'Portuguese',
      japanese: 'Japanese',
      korean: 'Korean',
      chinese: 'Chinese'
    }
  },  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      loading: 'Cargando...',
      saving: 'Guardando...',
      saveChanges: 'Guardar Cambios',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      close: 'Cerrar',
      yes: 'Sí',
      no: 'No',
      confirm: 'Confirmar',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      search: 'Buscar...'
    },
    navigation: {
      dashboard: 'Panel de Control',
      tasks: 'Tareas',
      projects: 'Proyectos',
      documents: 'Documentos',
      team: 'Equipo',
      analytics: 'Analíticas',
      settings: 'Configuración'
    },
    navbar: {
      notifications: 'Notificaciones',
      noNotifications: 'Sin notificaciones nuevas',
      myAccount: 'Mi Cuenta',
      profile: 'Perfil',
      settings: 'Configuración',
      logout: 'Cerrar Sesión'
    },
    dashboard: {
      welcomeMessage: 'Bienvenido de vuelta, aquí tienes una visión general de tus proyectos',
      totalProjects: 'Total de Proyectos',
      totalTasks: 'Total de Tareas',
      teamMembers: 'Miembros del Equipo',
      upcomingDeadlines: 'Fechas Límite Próximas',
      tasksInNext7Days: 'Tareas que vencen en los próximos 7 días',
      noTasksYet: 'Aún no hay Tareas',
      createFirstTask: 'Crea tu primera tarea para ver análisis de tareas y gráficos de distribución aquí.',
      getStartedTitle: 'Comienza con tu Primer Proyecto',
      getStartedDescription: 'Crea tu primer proyecto para comenzar a gestionar tareas, documentos, miembros del equipo y más.',
      createFirstProject: 'Crear tu Primer Proyecto'
    },
    tasks: {
      status: {
        todo: 'Por Hacer',
        inProgress: 'En Progreso',
        inReview: 'En Revisión',
        done: 'Completado'
      },
      priority: {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente'
      }
    },
    settings: {
      profile: {
        title: 'Perfil',
        information: 'Información del Perfil',
        informationDescription: 'Actualiza tu información de perfil visible para otros miembros del equipo',
        nickname: 'Apodo',
        nicknamePlaceholder: 'Ingresa tu apodo',
        email: 'Correo Electrónico',
        emailNote: 'El correo electrónico no se puede cambiar',
        avatarUrl: 'URL del Avatar',
        avatarPlaceholder: 'Ingresa la URL del avatar',
        language: 'Idioma',
        languagePlaceholder: 'Selecciona un idioma',
        changeAvatar: 'Cambiar Avatar',
        loading: 'Cargando perfil...'
      },
      notifications: {
        title: 'Notificaciones',
        preferences: 'Preferencias de Notificación',
        preferencesDescription: 'Controla cómo y cuándo recibes notificaciones',
        emailNotifications: 'Notificaciones por Correo',
        emailNotificationsDescription: 'Recibir notificaciones por correo electrónico',
        taskNotifications: 'Notificaciones de Tareas',
        taskAssignments: 'Asignaciones de tareas',
        taskUpdates: 'Actualizaciones y cambios de estado de tareas',
        projectNotifications: 'Notificaciones de Proyecto',
        projectUpdates: 'Actualizaciones de proyecto y hitos',
        teamCommunications: 'Comunicaciones del Equipo',
        teamMessages: 'Mensajes del equipo y menciones',
        weeklyDigest: 'Resumen semanal de actividades'
      },      security: {
        title: 'Seguridad',
        settings: 'Configuración de Seguridad',
        securitySettings: 'Configuración de Seguridad',
        settingsDescription: 'Gestiona la seguridad de tu cuenta y preferencias de inicio de sesión',
        securitySettingsDescription: 'Gestiona la seguridad de tu cuenta y preferencias de inicio de sesión',
        twoFactorAuth: 'Autenticación de Dos Factores',
        twoFactorDescription: 'Añade una capa extra de seguridad a tu cuenta',
        setUp: 'Configurar',
        password: 'Contraseña',
        changePassword: 'Cambiar Contraseña',
        loginSessions: 'Sesiones de Inicio',
        currentSession: 'Sesión Actual',
        lastActive: 'Última actividad: Ahora mismo',
        current: 'Actual'
      },
      appearance: {
        title: 'Apariencia',
        settings: 'Apariencia',
        settingsDescription: 'Personaliza las preferencias de tu interfaz',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Oscuro',
        system: 'Sistema',
        systemThemeDescription: 'Usando actualmente el tema {theme} basado en la preferencia del sistema',
        currentlyUsing: 'Usando actualmente el tema {theme}',
        density: 'Densidad',
        densityCompact: 'Compacto - Más contenido, menos espaciado',
        densityComfortable: 'Cómodo - Espaciado equilibrado',
        densitySpacious: 'Espacioso - Más espacio para respirar',
        defaultView: 'Vista Predeterminada',
        kanbanBoard: 'Tablero Kanban',
        ganttChart: 'Gráfico Gantt',
        listView: 'Vista de Lista'
      }
    },
    languages: {
      english: 'Inglés',
      spanish: 'Español',
      french: 'Francés',
      german: 'Alemán',
      italian: 'Italiano',
      portuguese: 'Portugués',
      japanese: 'Japonés',
      korean: 'Coreano',
      chinese: 'Chino'
    }
  },  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      saving: 'Enregistrement...',
      saveChanges: 'Enregistrer les Modifications',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      close: 'Fermer',
      yes: 'Oui',
      no: 'Non',
      confirm: 'Confirmer',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      search: 'Rechercher...'
    },
    navigation: {
      dashboard: 'Tableau de bord',
      tasks: 'Tâches',
      projects: 'Projets',
      documents: 'Documents',
      team: 'Équipe',
      analytics: 'Analyses',
      settings: 'Paramètres'
    },
    navbar: {
      notifications: 'Notifications',
      noNotifications: 'Aucune nouvelle notification',
      myAccount: 'Mon Compte',
      profile: 'Profil',
      settings: 'Paramètres',
      logout: 'Déconnexion'
    },
    dashboard: {
      welcomeMessage: 'Bon retour, voici un aperçu de vos projets',
      totalProjects: 'Total des Projets',
      totalTasks: 'Total des Tâches',
      teamMembers: 'Membres de l\'Équipe',
      upcomingDeadlines: 'Échéances Prochaines',
      tasksInNext7Days: 'Tâches à échoir dans les 7 prochains jours',
      noTasksYet: 'Aucune Tâche Encore',
      createFirstTask: 'Créez votre première tâche pour voir les analyses de tâches et les graphiques de distribution ici.',
      getStartedTitle: 'Commencer avec Votre Premier Projet',
      getStartedDescription: 'Créez votre premier projet pour commencer à gérer les tâches, documents, membres d\'équipe, et plus.',
      createFirstProject: 'Créer Votre Premier Projet'
    },
    tasks: {
      status: {
        todo: 'À Faire',
        inProgress: 'En Cours',
        inReview: 'En Révision',
        done: 'Terminé'
      },
      priority: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée',
        urgent: 'Urgente'
      }
    },
    settings: {
      profile: {
        title: 'Profil',
        information: 'Informations du Profil',
        informationDescription: 'Mettez à jour vos informations de profil visibles par les autres membres de l\'équipe',
        nickname: 'Surnom',
        nicknamePlaceholder: 'Entrez votre surnom',
        email: 'Email',
        emailNote: 'L\'email ne peut pas être modifié',
        avatarUrl: 'URL de l\'Avatar',
        avatarPlaceholder: 'Entrez l\'URL de l\'avatar',
        language: 'Langue',
        languagePlaceholder: 'Sélectionnez une langue',
        changeAvatar: 'Changer l\'Avatar',
        loading: 'Chargement du profil...'
      },
      notifications: {
        title: 'Notifications',
        preferences: 'Préférences de Notification',
        preferencesDescription: 'Contrôlez comment et quand vous recevez les notifications',
        emailNotifications: 'Notifications par Email',
        emailNotificationsDescription: 'Recevoir des notifications par email',
        taskNotifications: 'Notifications de Tâches',
        taskAssignments: 'Assignations de tâches',
        taskUpdates: 'Mises à jour et changements d\'état des tâches',
        projectNotifications: 'Notifications de Projet',
        projectUpdates: 'Mises à jour de projet et jalons',
        teamCommunications: 'Communications d\'Équipe',
        teamMessages: 'Messages d\'équipe et mentions',
        weeklyDigest: 'Résumé hebdomadaire d\'activité'
      },      security: {
        title: 'Sécurité',
        settings: 'Paramètres de Sécurité',
        securitySettings: 'Paramètres de Sécurité',
        settingsDescription: 'Gérez la sécurité de votre compte et les préférences de connexion',
        securitySettingsDescription: 'Gérez la sécurité de votre compte et les préférences de connexion',
        twoFactorAuth: 'Authentification à Deux Facteurs',
        twoFactorDescription: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
        setUp: 'Configurer',
        password: 'Mot de passe',
        changePassword: 'Changer le Mot de passe',
        loginSessions: 'Sessions de Connexion',
        currentSession: 'Session Actuelle',
        lastActive: 'Dernière activité: À l\'instant',
        current: 'Actuelle'
      },
      appearance: {
        title: 'Apparence',
        settings: 'Apparence',
        settingsDescription: 'Personnalisez vos préférences d\'interface',
        theme: 'Thème',
        light: 'Clair',
        dark: 'Sombre',
        system: 'Système',
        systemThemeDescription: 'Utilise actuellement le thème {theme} basé sur la préférence système',
        currentlyUsing: 'Utilise actuellement le thème {theme}',
        density: 'Densité',
        densityCompact: 'Compact - Plus de contenu, moins d\'espacement',
        densityComfortable: 'Confortable - Espacement équilibré',
        densitySpacious: 'Spacieux - Plus d\'espace de respiration',
        defaultView: 'Vue par Défaut',
        kanbanBoard: 'Tableau Kanban',
        ganttChart: 'Diagramme de Gantt',
        listView: 'Vue Liste'
      }
    },
    languages: {
      english: 'Anglais',
      spanish: 'Espagnol',
      french: 'Français',
      german: 'Allemand',
      italian: 'Italien',
      portuguese: 'Portugais',
      japanese: 'Japonais',
      korean: 'Coréen',
      chinese: 'Chinois'
    }
  },  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      loading: 'Lädt...',
      saving: 'Speichert...',
      saveChanges: 'Änderungen Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      close: 'Schließen',
      yes: 'Ja',
      no: 'Nein',
      confirm: 'Bestätigen',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      info: 'Information',
      search: 'Suchen...'
    },
    navigation: {
      dashboard: 'Dashboard',
      tasks: 'Aufgaben',
      projects: 'Projekte',
      documents: 'Dokumente',
      team: 'Team',
      analytics: 'Analysen',
      settings: 'Einstellungen'
    },
    navbar: {
      notifications: 'Benachrichtigungen',
      noNotifications: 'Keine neuen Benachrichtigungen',
      myAccount: 'Mein Konto',
      profile: 'Profil',
      settings: 'Einstellungen',
      logout: 'Abmelden'
    },
    dashboard: {
      welcomeMessage: 'Willkommen zurück, hier ist eine Übersicht Ihrer Projekte',
      totalProjects: 'Gesamte Projekte',
      totalTasks: 'Gesamte Aufgaben',
      teamMembers: 'Teammitglieder',
      upcomingDeadlines: 'Bevorstehende Fristen',
      tasksInNext7Days: 'Aufgaben, die in den nächsten 7 Tagen fällig sind',
      noTasksYet: 'Noch Keine Aufgaben',
      createFirstTask: 'Erstellen Sie Ihre erste Aufgabe, um hier Aufgabenanalysen und Verteilungsdiagramme zu sehen.',
      getStartedTitle: 'Beginnen Sie mit Ihrem Ersten Projekt',
      getStartedDescription: 'Erstellen Sie Ihr erstes Projekt, um mit der Verwaltung von Aufgaben, Dokumenten, Teammitgliedern und mehr zu beginnen.',
      createFirstProject: 'Ihr Erstes Projekt Erstellen'
    },
    tasks: {
      status: {
        todo: 'Zu Erledigen',
        inProgress: 'In Bearbeitung',
        inReview: 'In Überprüfung',
        done: 'Fertig'
      },
      priority: {
        low: 'Niedrig',
        medium: 'Mittel',
        high: 'Hoch',
        urgent: 'Dringend'
      }
    },
    settings: {
      profile: {
        title: 'Profil',
        information: 'Profil-Informationen',
        informationDescription: 'Aktualisieren Sie Ihre Profilinformationen, die für andere Teammitglieder sichtbar sind',
        nickname: 'Spitzname',
        nicknamePlaceholder: 'Geben Sie Ihren Spitznamen ein',
        email: 'E-Mail',
        emailNote: 'E-Mail kann nicht geändert werden',
        avatarUrl: 'Avatar-URL',
        avatarPlaceholder: 'Avatar-URL eingeben',
        language: 'Sprache',
        languagePlaceholder: 'Wählen Sie eine Sprache',
        changeAvatar: 'Avatar Ändern',
        loading: 'Profil wird geladen...'
      },
      notifications: {
        title: 'Benachrichtigungen',
        preferences: 'Benachrichtigungseinstellungen',
        preferencesDescription: 'Kontrollieren Sie, wie und wann Sie Benachrichtigungen erhalten',
        emailNotifications: 'E-Mail-Benachrichtigungen',
        emailNotificationsDescription: 'Benachrichtigungen per E-Mail erhalten',
        taskNotifications: 'Aufgaben-Benachrichtigungen',
        taskAssignments: 'Aufgabenzuweisungen',
        taskUpdates: 'Aufgaben-Updates und Statusänderungen',
        projectNotifications: 'Projekt-Benachrichtigungen',
        projectUpdates: 'Projekt-Updates und Meilensteine',
        teamCommunications: 'Team-Kommunikation',
        teamMessages: 'Team-Nachrichten und Erwähnungen',
        weeklyDigest: 'Wöchentliche Aktivitätsübersicht'
      },      security: {
        title: 'Sicherheit',
        settings: 'Sicherheitseinstellungen',
        securitySettings: 'Sicherheitseinstellungen',
        settingsDescription: 'Verwalten Sie Ihre Kontosicherheit und Anmeldepräferenzen',
        securitySettingsDescription: 'Verwalten Sie Ihre Kontosicherheit und Anmeldepräferenzen',
        twoFactorAuth: 'Zwei-Faktor-Authentifizierung',
        twoFactorDescription: 'Fügen Sie eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu',
        setUp: 'Einrichten',
        password: 'Passwort',
        changePassword: 'Passwort Ändern',
        loginSessions: 'Anmeldesitzungen',
        currentSession: 'Aktuelle Sitzung',
        lastActive: 'Zuletzt aktiv: Gerade eben',
        current: 'Aktuell'
      },
      appearance: {
        title: 'Erscheinungsbild',
        settings: 'Erscheinungsbild',
        settingsDescription: 'Passen Sie Ihre Schnittstellenpräferenzen an',
        theme: 'Design',
        light: 'Hell',
        dark: 'Dunkel',        system: 'System',
        systemThemeDescription: 'Verwendet derzeit das {theme} Design basierend auf der Systemeinstellung',
        currentlyUsing: 'Verwendet derzeit das {theme} Design',
        density: 'Dichte',
        densityCompact: 'Kompakt - Mehr Inhalt, weniger Abstand',
        densityComfortable: 'Komfortabel - Ausgewogener Abstand',
        densitySpacious: 'Geräumig - Mehr Atemraum',
        defaultView: 'Standardansicht',
        kanbanBoard: 'Kanban-Board',
        ganttChart: 'Gantt-Diagramm',
        listView: 'Listenansicht'
      }
    },
    languages: {
      english: 'Englisch',
      spanish: 'Spanisch',
      french: 'Französisch',
      german: 'Deutsch',
      italian: 'Italienisch',
      portuguese: 'Portugiesisch',
      japanese: 'Japanisch',
      korean: 'Koreanisch',
      chinese: 'Chinesisch'
    }
  },  it: {
    common: {
      save: 'Salva',
      cancel: 'Annulla',
      loading: 'Caricamento...',
      saving: 'Salvataggio...',
      saveChanges: 'Salva Modifiche',
      delete: 'Elimina',
      edit: 'Modifica',
      add: 'Aggiungi',
      close: 'Chiudi',
      yes: 'Sì',
      no: 'No',
      confirm: 'Conferma',
      error: 'Errore',
      success: 'Successo',
      warning: 'Avviso',
      info: 'Informazione',
      search: 'Cerca...'
    },
    navigation: {
      dashboard: 'Dashboard',
      tasks: 'Attività',
      projects: 'Progetti',
      documents: 'Documenti',
      team: 'Team',
      analytics: 'Analisi',
      settings: 'Impostazioni'
    },
    navbar: {
      notifications: 'Notifiche',
      noNotifications: 'Nessuna nuova notifica',
      myAccount: 'Il Mio Account',
      profile: 'Profilo',
      settings: 'Impostazioni',
      logout: 'Disconnetti'
    },
    dashboard: {
      welcomeMessage: 'Bentornato, ecco una panoramica dei tuoi progetti',
      totalProjects: 'Progetti Totali',
      totalTasks: 'Attività Totali',
      teamMembers: 'Membri del Team',
      upcomingDeadlines: 'Scadenze Imminenti',
      tasksInNext7Days: 'Attività in scadenza nei prossimi 7 giorni',
      noTasksYet: 'Nessuna Attività Ancora',
      createFirstTask: 'Crea la tua prima attività per vedere analisi delle attività e grafici di distribuzione qui.',
      getStartedTitle: 'Inizia con il Tuo Primo Progetto',
      getStartedDescription: 'Crea il tuo primo progetto per iniziare a gestire attività, documenti, membri del team e altro.',
      createFirstProject: 'Crea il Tuo Primo Progetto'
    },
    tasks: {
      status: {
        todo: 'Da Fare',
        inProgress: 'In Corso',
        inReview: 'In Revisione',
        done: 'Completato'
      },
      priority: {
        low: 'Bassa',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente'
      }
    },
    settings: {
      profile: {
        title: 'Profilo',
        information: 'Informazioni Profilo',
        informationDescription: 'Aggiorna le tue informazioni del profilo visibili ad altri membri del team',
        nickname: 'Soprannome',
        nicknamePlaceholder: 'Inserisci il tuo soprannome',
        email: 'Email',
        emailNote: 'L\'email non può essere modificata',
        avatarUrl: 'URL Avatar',
        avatarPlaceholder: 'Inserisci URL avatar',
        language: 'Lingua',
        languagePlaceholder: 'Seleziona una lingua',
        changeAvatar: 'Cambia Avatar',
        loading: 'Caricamento profilo...'
      },
      notifications: {
        title: 'Notifiche',
        preferences: 'Preferenze Notifiche',
        preferencesDescription: 'Controlla come e quando ricevi le notifiche',
        emailNotifications: 'Notifiche Email',
        emailNotificationsDescription: 'Ricevi notifiche via email',
        taskNotifications: 'Notifiche Attività',
        taskAssignments: 'Assegnazioni attività',
        taskUpdates: 'Aggiornamenti attività e cambi di stato',
        projectNotifications: 'Notifiche Progetto',
        projectUpdates: 'Aggiornamenti progetto e milestone',
        teamCommunications: 'Comunicazioni Team',
        teamMessages: 'Messaggi team e menzioni',
        weeklyDigest: 'Riepilogo settimanale attività'
      },      security: {
        title: 'Sicurezza',
        settings: 'Impostazioni Sicurezza',
        securitySettings: 'Impostazioni di Sicurezza',
        settingsDescription: 'Gestisci la sicurezza del tuo account e le preferenze di accesso',
        securitySettingsDescription: 'Gestisci la sicurezza del tuo account e le preferenze di accesso',
        twoFactorAuth: 'Autenticazione a Due Fattori',
        twoFactorDescription: 'Aggiungi un livello extra di sicurezza al tuo account',
        setUp: 'Configura',
        password: 'Password',
        changePassword: 'Cambia Password',
        loginSessions: 'Sessioni di Accesso',
        currentSession: 'Sessione Corrente',
        lastActive: 'Ultimo accesso: Adesso',
        current: 'Corrente'
      },
      appearance: {
        title: 'Aspetto',
        settings: 'Aspetto',
        settingsDescription: 'Personalizza le tue preferenze dell\'interfaccia',
        theme: 'Tema',
        light: 'Chiaro',
        dark: 'Scuro',        system: 'Sistema',
        systemThemeDescription: 'Attualmente usa il tema {theme} basato sulla preferenza di sistema',
        currentlyUsing: 'Attualmente usando il tema {theme}',
        density: 'Densità',
        densityCompact: 'Compatto - Più contenuto, meno spaziatura',
        densityComfortable: 'Confortevole - Spaziatura bilanciata',
        densitySpacious: 'Spazioso - Più spazio di respiro',
        defaultView: 'Vista Predefinita',
        kanbanBoard: 'Kanban Board',
        ganttChart: 'Diagramma Gantt',
        listView: 'Vista Lista'
      }
    },
    languages: {
      english: 'Inglese',
      spanish: 'Spagnolo',
      french: 'Francese',
      german: 'Tedesco',
      italian: 'Italiano',
      portuguese: 'Portoghese',
      japanese: 'Giapponese',
      korean: 'Coreano',
      chinese: 'Cinese'
    }
  },  pt: {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      loading: 'Carregando...',
      saving: 'Salvando...',
      saveChanges: 'Salvar Alterações',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      close: 'Fechar',
      yes: 'Sim',
      no: 'Não',
      confirm: 'Confirmar',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      search: 'Pesquisar...'
    },
    navigation: {
      dashboard: 'Painel',
      tasks: 'Tarefas',
      projects: 'Projetos',
      documents: 'Documentos',
      team: 'Equipe',
      analytics: 'Análises',
      settings: 'Configurações'
    },
    navbar: {
      notifications: 'Notificações',
      noNotifications: 'Nenhuma nova notificação',
      myAccount: 'Minha Conta',
      profile: 'Perfil',
      settings: 'Configurações',
      logout: 'Sair'
    },
    dashboard: {
      welcomeMessage: 'Bem-vindo de volta, aqui está uma visão geral dos seus projetos',
      totalProjects: 'Projetos Totais',
      totalTasks: 'Tarefas Totais',
      teamMembers: 'Membros da Equipe',
      upcomingDeadlines: 'Prazos Próximos',
      tasksInNext7Days: 'Tarefas com vencimento nos próximos 7 dias',
      noTasksYet: 'Nenhuma Tarefa Ainda',
      createFirstTask: 'Crie sua primeira tarefa para ver análises de tarefas e gráficos de distribuição aqui.',
      getStartedTitle: 'Comece com Seu Primeiro Projeto',
      getStartedDescription: 'Crie seu primeiro projeto para começar a gerenciar tarefas, documentos, membros da equipe e muito mais.',
      createFirstProject: 'Criar Seu Primeiro Projeto'
    },
    tasks: {
      status: {
        todo: 'A Fazer',
        inProgress: 'Em Andamento',
        inReview: 'Em Revisão',
        done: 'Concluído'
      },
      priority: {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        urgent: 'Urgente'
      }
    },
    settings: {
      profile: {
        title: 'Perfil',
        information: 'Informações do Perfil',
        informationDescription: 'Atualize suas informações de perfil visíveis para outros membros da equipe',
        nickname: 'Apelido',
        nicknamePlaceholder: 'Digite seu apelido',
        email: 'Email',
        emailNote: 'O email não pode ser alterado',
        avatarUrl: 'URL do Avatar',
        avatarPlaceholder: 'Digite a URL do avatar',
        language: 'Idioma',
        languagePlaceholder: 'Selecione um idioma',
        changeAvatar: 'Alterar Avatar',
        loading: 'Carregando perfil...'
      },
      notifications: {
        title: 'Notificações',
        preferences: 'Preferências de Notificação',
        preferencesDescription: 'Controle como e quando você recebe notificações',
        emailNotifications: 'Notificações por Email',
        emailNotificationsDescription: 'Receber notificações por email',
        taskNotifications: 'Notificações de Tarefas',
        taskAssignments: 'Atribuições de tarefas',
        taskUpdates: 'Atualizações de tarefas e mudanças de status',
        projectNotifications: 'Notificações de Projeto',
        projectUpdates: 'Atualizações de projeto e marcos',
        teamCommunications: 'Comunicações da Equipe',
        teamMessages: 'Mensagens da equipe e menções',
        weeklyDigest: 'Resumo semanal de atividades'
      },      security: {
        title: 'Segurança',
        settings: 'Configurações de Segurança',
        securitySettings: 'Configurações de Segurança',
        settingsDescription: 'Gerencie a segurança da sua conta e preferências de login',
        securitySettingsDescription: 'Gerencie a segurança da sua conta e preferências de login',
        twoFactorAuth: 'Autenticação de Dois Fatores',
        twoFactorDescription: 'Adicione uma camada extra de segurança à sua conta',
        setUp: 'Configurar',
        password: 'Senha',
        changePassword: 'Alterar Senha',
        loginSessions: 'Sessões de Login',
        currentSession: 'Sessão Atual',
        lastActive: 'Última atividade: Agora mesmo',
        current: 'Atual'
      },
      appearance: {
        title: 'Aparência',
        settings: 'Aparência',
        settingsDescription: 'Personalize suas preferências de interface',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Escuro',        system: 'Sistema',
        systemThemeDescription: 'Usando atualmente o tema {theme} baseado na preferência do sistema',
        currentlyUsing: 'Usando atualmente o tema {theme}',
        density: 'Densidade',
        densityCompact: 'Compacto - Mais conteúdo, menos espaçamento',
        densityComfortable: 'Confortável - Espaçamento equilibrado',
        densitySpacious: 'Espaçoso - Mais espaço para respirar',
        defaultView: 'Visualização Padrão',
        kanbanBoard: 'Quadro Kanban',
        ganttChart: 'Gráfico Gantt',
        listView: 'Visualização em Lista'
      }
    },
    languages: {
      english: 'Inglês',
      spanish: 'Espanhol',
      french: 'Francês',
      german: 'Alemão',
      italian: 'Italiano',
      portuguese: 'Português',
      japanese: 'Japonês',
      korean: 'Coreano',
      chinese: 'Chinês'
    }
  },  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      loading: '読み込み中...',
      saving: '保存中...',
      saveChanges: '変更を保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      close: '閉じる',
      yes: 'はい',
      no: 'いいえ',
      confirm: '確認',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報',
      search: '検索...'
    },
    navigation: {
      dashboard: 'ダッシュボード',
      tasks: 'タスク',
      projects: 'プロジェクト',
      documents: 'ドキュメント',
      team: 'チーム',
      analytics: '分析',
      settings: '設定'
    },
    navbar: {
      notifications: '通知',
      noNotifications: '新しい通知はありません',
      myAccount: 'マイアカウント',
      profile: 'プロフィール',
      settings: '設定',
      logout: 'ログアウト'
    },
    dashboard: {
      welcomeMessage: 'おかえりなさい、プロジェクトの概要をご覧ください',
      totalProjects: '総プロジェクト数',
      totalTasks: '総タスク数',
      teamMembers: 'チームメンバー',
      upcomingDeadlines: '今後の締切',
      tasksInNext7Days: '今後7日間に期限が来るタスク',
      noTasksYet: 'まだタスクがありません',
      createFirstTask: '最初のタスクを作成して、タスク分析と分布チャートをここで確認しましょう。',
      getStartedTitle: '最初のプロジェクトを始めよう',
      getStartedDescription: '最初のプロジェクトを作成して、タスク、ドキュメント、チームメンバーなどの管理を始めましょう。',
      createFirstProject: '最初のプロジェクトを作成'
    },
    tasks: {
      status: {
        todo: '未着手',
        inProgress: '進行中',
        inReview: 'レビュー中',
        done: '完了'
      },
      priority: {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '緊急'
      }
    },
    settings: {
      profile: {
        title: 'プロフィール',
        information: 'プロフィール情報',
        informationDescription: '他のチームメンバーに表示されるプロフィール情報を更新',
        nickname: 'ニックネーム',
        nicknamePlaceholder: 'ニックネームを入力',
        email: 'メール',
        emailNote: 'メールアドレスは変更できません',
        avatarUrl: 'アバターURL',
        avatarPlaceholder: 'アバターURLを入力',
        language: '言語',
        languagePlaceholder: '言語を選択',
        changeAvatar: 'アバターを変更',
        loading: 'プロフィールを読み込み中...'
      },
      notifications: {
        title: '通知',
        preferences: '通知設定',
        preferencesDescription: '通知の受信方法とタイミングを制御',
        emailNotifications: 'メール通知',
        emailNotificationsDescription: 'メールで通知を受信',
        taskNotifications: 'タスク通知',
        taskAssignments: 'タスクの割り当て',
        taskUpdates: 'タスクの更新とステータス変更',
        projectNotifications: 'プロジェクト通知',
        projectUpdates: 'プロジェクトの更新とマイルストーン',
        teamCommunications: 'チームコミュニケーション',
        teamMessages: 'チームメッセージとメンション',
        weeklyDigest: '週間アクティビティサマリー'
      },      security: {
        title: 'セキュリティ',
        settings: 'セキュリティ設定',
        securitySettings: 'セキュリティ設定',
        settingsDescription: 'アカウントのセキュリティとログイン設定を管理',
        securitySettingsDescription: 'アカウントのセキュリティとログイン設定を管理',
        twoFactorAuth: '二要素認証',
        twoFactorDescription: 'アカウントにセキュリティの追加レイヤーを追加',
        setUp: '設定',
        password: 'パスワード',
        changePassword: 'パスワードを変更',
        loginSessions: 'ログインセッション',
        currentSession: '現在のセッション',
        lastActive: '最終アクティブ: たった今',
        current: '現在'
      },
      appearance: {
        title: '外観',
        settings: '外観',
        settingsDescription: 'インターフェースの設定をカスタマイズ',
        theme: 'テーマ',
        light: 'ライト',
        dark: 'ダーク',        system: 'システム',
        systemThemeDescription: '現在システム設定に基づいて{theme}テーマを使用中',
        currentlyUsing: '現在{theme}テーマを使用中',
        density: '密度',
        densityCompact: 'コンパクト - より多くのコンテンツ、少ないスペース',
        densityComfortable: 'コンフォート - バランスの取れたスペース',
        densitySpacious: 'スペーシャス - より多くの余白',
        defaultView: 'デフォルトビュー',
        kanbanBoard: 'かんばんボード',
        ganttChart: 'ガントチャート',
        listView: 'リストビュー'
      }
    },
    languages: {
      english: '英語',
      spanish: 'スペイン語',
      french: 'フランス語',
      german: 'ドイツ語',
      italian: 'イタリア語',
      portuguese: 'ポルトガル語',
      japanese: '日本語',
      korean: '韓国語',
      chinese: '中国語'
    }
  },  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      loading: '로딩 중...',
      saving: '저장 중...',
      saveChanges: '변경사항 저장',
      delete: '삭제',
      edit: '편집',
      add: '추가',
      close: '닫기',
      yes: '예',
      no: '아니오',
      confirm: '확인',
      error: '오류',
      success: '성공',
      warning: '경고',
      info: '정보',
      search: '검색...'
    },
    navigation: {
      dashboard: '대시보드',
      tasks: '작업',
      projects: '프로젝트',
      documents: '문서',
      team: '팀',
      analytics: '분석',
      settings: '설정'
    },
    navbar: {
      notifications: '알림',
      noNotifications: '새 알림이 없습니다',
      myAccount: '내 계정',
      profile: '프로필',
      settings: '설정',
      logout: '로그아웃'
    },
    dashboard: {
      welcomeMessage: '다시 오신 것을 환영합니다. 프로젝트 개요입니다',
      totalProjects: '총 프로젝트',
      totalTasks: '총 작업',
      teamMembers: '팀 구성원',
      upcomingDeadlines: '다가오는 마감일',
      tasksInNext7Days: '앞으로 7일 내에 마감되는 작업',
      noTasksYet: '아직 작업이 없습니다',
      createFirstTask: '첫 번째 작업을 생성하여 작업 분석 및 분포 차트를 여기에서 확인하세요.',
      getStartedTitle: '첫 번째 프로젝트로 시작하기',
      getStartedDescription: '첫 번째 프로젝트를 생성하여 작업, 문서, 팀 구성원 등을 관리하기 시작하세요.',
      createFirstProject: '첫 번째 프로젝트 생성'
    },
    tasks: {
      status: {
        todo: '할 일',
        inProgress: '진행 중',
        inReview: '검토 중',
        done: '완료'
      },
      priority: {
        low: '낮음',
        medium: '보통',
        high: '높음',
        urgent: '긴급'
      }
    },
    settings: {
      profile: {
        title: '프로필',
        information: '프로필 정보',
        informationDescription: '다른 팀 구성원에게 표시되는 프로필 정보를 업데이트',
        nickname: '닉네임',
        nicknamePlaceholder: '닉네임을 입력하세요',
        email: '이메일',
        emailNote: '이메일은 변경할 수 없습니다',
        avatarUrl: '아바타 URL',
        avatarPlaceholder: '아바타 URL을 입력하세요',
        language: '언어',
        languagePlaceholder: '언어를 선택하세요',
        changeAvatar: '아바타 변경',
        loading: '프로필 로딩 중...'
      },
      notifications: {
        title: '알림',
        preferences: '알림 설정',
        preferencesDescription: '알림을 받는 방법과 시점을 제어',
        emailNotifications: '이메일 알림',
        emailNotificationsDescription: '이메일로 알림 받기',
        taskNotifications: '작업 알림',
        taskAssignments: '작업 할당',
        taskUpdates: '작업 업데이트 및 상태 변경',
        projectNotifications: '프로젝트 알림',
        projectUpdates: '프로젝트 업데이트 및 마일스톤',
        teamCommunications: '팀 커뮤니케이션',
        teamMessages: '팀 메시지 및 멘션',
        weeklyDigest: '주간 활동 요약'
      },      security: {
        title: '보안',
        settings: '보안 설정',
        securitySettings: '보안 설정',
        settingsDescription: '계정 보안 및 로그인 설정 관리',
        securitySettingsDescription: '계정 보안 및 로그인 설정 관리',
        twoFactorAuth: '2단계 인증',
        twoFactorDescription: '계정에 추가 보안 레이어 추가',
        setUp: '설정',
        password: '비밀번호',
        changePassword: '비밀번호 변경',
        loginSessions: '로그인 세션',
        currentSession: '현재 세션',
        lastActive: '마지막 활동: 방금 전',
        current: '현재'
      },
      appearance: {
        title: '외관',
        settings: '외관',
        settingsDescription: '인터페이스 설정 사용자 정의',
        theme: '테마',
        light: '라이트',
        dark: '다크',        system: '시스템',
        systemThemeDescription: '현재 시스템 설정에 따라 {theme} 테마를 사용 중',
        currentlyUsing: '현재 {theme} 테마를 사용 중',
        density: '밀도',
        densityCompact: '컴팩트 - 더 많은 콘텐츠, 적은 간격',
        densityComfortable: '편안함 - 균형잡힌 간격',
        densitySpacious: '여유롭게 - 더 많은 여백',
        defaultView: '기본 보기',
        kanbanBoard: '칸반 보드',
        ganttChart: '간트 차트',
        listView: '목록 보기'
      }
    },
    languages: {
      english: '영어',
      spanish: '스페인어',
      french: '프랑스어',
      german: '독일어',
      italian: '이탈리아어',
      portuguese: '포르투갈어',
      japanese: '일본어',
      korean: '한국어',
      chinese: '중국어'
    }
  },  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      loading: '加载中...',
      saving: '保存中...',
      saveChanges: '保存更改',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      close: '关闭',
      yes: '是',
      no: '否',
      confirm: '确认',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息',
      search: '搜索...'
    },
    navigation: {
      dashboard: '仪表板',
      tasks: '任务',
      projects: '项目',
      documents: '文档',
      team: '团队',
      analytics: '分析',
      settings: '设置'
    },
    navbar: {
      notifications: '通知',
      noNotifications: '没有新通知',
      myAccount: '我的账户',
      profile: '个人资料',
      settings: '设置',
      logout: '退出登录'
    },
    dashboard: {
      welcomeMessage: '欢迎回来，这里是您项目的概览',
      totalProjects: '总项目数',
      totalTasks: '总任务数',
      teamMembers: '团队成员',
      upcomingDeadlines: '即将到期',
      tasksInNext7Days: '未来7天内到期的任务',
      noTasksYet: '暂无任务',
      createFirstTask: '创建您的第一个任务，在这里查看任务分析和分布图表。',
      getStartedTitle: '开始您的第一个项目',
      getStartedDescription: '创建您的第一个项目，开始管理任务、文档、团队成员等。',
      createFirstProject: '创建您的第一个项目'
    },
    tasks: {
      status: {
        todo: '待办',
        inProgress: '进行中',
        inReview: '审核中',
        done: '已完成'
      },
      priority: {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      }
    },
    settings: {
      profile: {
        title: '个人资料',
        information: '个人资料信息',
        informationDescription: '更新其他团队成员可见的个人资料信息',
        nickname: '昵称',
        nicknamePlaceholder: '输入您的昵称',
        email: '邮箱',
        emailNote: '邮箱无法更改',
        avatarUrl: '头像URL',
        avatarPlaceholder: '输入头像URL',
        language: '语言',
        languagePlaceholder: '选择语言',
        changeAvatar: '更改头像',
        loading: '加载个人资料中...'
      },
      notifications: {
        title: '通知',
        preferences: '通知设置',
        preferencesDescription: '控制接收通知的方式和时间',
        emailNotifications: '邮件通知',
        emailNotificationsDescription: '通过邮件接收通知',
        taskNotifications: '任务通知',
        taskAssignments: '任务分配',
        taskUpdates: '任务更新和状态变更',
        projectNotifications: '项目通知',
        projectUpdates: '项目更新和里程碑',
        teamCommunications: '团队沟通',
        teamMessages: '团队消息和提及',
        weeklyDigest: '每周活动摘要'
      },      security: {
        title: '安全',
        settings: '安全设置',
        securitySettings: '安全设置',
        settingsDescription: '管理您的账户安全和登录偏好',
        securitySettingsDescription: '管理您的账户安全和登录偏好',
        twoFactorAuth: '双因素认证',
        twoFactorDescription: '为您的账户添加额外的安全层',
        setUp: '设置',
        password: '密码',
        changePassword: '更改密码',
        loginSessions: '登录会话',
        currentSession: '当前会话',
        lastActive: '最后活动：刚刚',
        current: '当前'
      },
      appearance: {
        title: '外观',
        settings: '外观',
        settingsDescription: '自定义您的界面偏好',
        theme: '主题',
        light: '浅色',
        dark: '深色',        system: '系统',
        systemThemeDescription: '当前基于系统偏好使用{theme}主题',
        currentlyUsing: '当前使用{theme}主题',
        density: '密度',
        densityCompact: '紧凑 - 更多内容，更少间距',
        densityComfortable: '舒适 - 平衡的间距',
        densitySpacious: '宽松 - 更多呼吸空间',
        defaultView: '默认视图',
        kanbanBoard: '看板',
        ganttChart: '甘特图',
        listView: '列表视图'
      }
    },
    languages: {
      english: '英语',
      spanish: '西班牙语',
      french: '法语',
      german: '德语',
      italian: '意大利语',
      portuguese: '葡萄牙语',
      japanese: '日语',
      korean: '韩语',
      chinese: '中文'
    }
  }
};

// Helper function to get nested translation
export function getTranslation(
  translations: Translations,
  key: string,
  params?: Record<string, string>
): string {
  const keys = key.split('.');
  let result: any = translations;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return the key if translation not found
    }
  }
  
  if (typeof result === 'string') {
    // Replace placeholders with parameters
    if (params) {
      return Object.entries(params).reduce((str, [param, value]) => {
        return str.replace(new RegExp(`{${param}}`, 'g'), value);
      }, result);
    }
    return result;
  }
  
  return key; // Return the key if translation not found
}
