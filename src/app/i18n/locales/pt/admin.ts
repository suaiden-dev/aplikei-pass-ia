const admin = {
    shared: {
        back: "Voltar",
        save: "Salvar",
        loading: "Carregando...",
        success: "Sucesso!",
        error: "Erro",
        cancel: "Cancelar",
        confirm: "Confirmar",
        administrativeAction: "Ação Administrativa",
        rejection: {
            confirm: "Confirmar Rejeição",
        },
        table: {
            empty: "Nenhum arquivo",
        },
        registration: "Registro",
        paid: "Pago",
        client: "Cliente",
        roleLabels: {
            master: "Master",
            admin_lawyer: "Admin Advogado",
            manager: "Gerente",
            seller: "Vendedor",
            customer: "Cliente"
        },
        view: "Ver",
        remove: "Remover",
        locale: "pt-BR"
    },
    nav: {
        overview: "Visão Geral",
        revenue: "Financeiro",
        finance_analytics: "Análise Financeira",
        dashboard: "Painel",
        matters: "Processos",
        lawyers: "Advogados",
        products: "Produtos",
        chats: "Mensagens",
        customers: "Clientes",
        plans: "Planos",
        coupons: "Cupons",
        roles: "Equipes",
        pageBuilder: "Construtor de Páginas",
        caseLaw: "Jurisprudência",
        documents: "Documentos",
        billing: "Faturamento",
        analytics: "Análise",
        settings: "Configurações",
        paymentSettings: "Métodos de Pagamento",
        withdrawals: "Saques",
        billings: "Cobranças",
        offices: "Escritórios",
        subscription: "Minha Assinatura",
        companyProfile: "Perfil da Empresa"
    },
    financeAnalytics: {
        title: "Análise Financeira",
        masterOnly: "Apenas Master",
        subtitle: "Acompanhamento avançado de performance e lucro da plataforma",
        charts: {
            revenueGrowth: "Crescimento de Receita",
            revenueVsProfit: "Receita vs Lucro",
            revenueLegend: "Receita",
            profitLegend: "Lucro"
        },
        table: {
            title: "Transações Recentes",
            growthBadge: "+12.5% neste mês",
            customer: "Cliente",
            office: "Escritório",
            product: "Produto",
            amount: "Valor",
            method: "Método",
            action: "Ação",
            details: "Detalhes",
            empty: "Nenhuma transação encontrada para análise."
        },
        states: {
            loadErrorTitle: "Falha ao carregar dados",
            retry: "Tentar novamente"
        },
        modal: {
            title: "Detalhes da Transação",
            customer: "Cliente",
            office: "Escritório",
            product: "Produto",
            total: "Total",
            statusMethod: "Status / Método",
            close: "Fechar"
        }
    },
    payoutSettings: {
      title: "Configuração de Recebimento",
      subtitle: "Configure seus métodos de pagamento e preferências de saque",
      sections: {
        paymentLinks: {
          title: "Links de Pagamento",
          description: "Configure seus links de pagamento direto para clientes",
          stripe: "Link de Pagamento Stripe",
          zelle: "Link de Pagamento Zelle",
          stripePlaceholder: "https://buy.stripe.com/...",
          zellePlaceholder: "https://zellepay.com/..."
        },
        zelleConfig: {
          title: "Configuração Zelle",
          description: "Detalhes específicos para recebimento via Zelle",
          name: "Nome da Conta Zelle",
          identifier: "Identificador Zelle (E-mail/Telefone)",
          namePlaceholder: "Nome completo na conta",
          identifierPlaceholder: "email@exemplo.com ou telefone"
        }
      },
      messages: {
        saveSuccess: "Configurações de recebimento atualizadas!",
        saveError: "Erro ao salvar configurações.",
        loadError: "Erro ao carregar configurações."
      },
      saveBtn: "Salvar Configuração",
      savingBtn: "Salvando..."
    },
    overview: {
        title: "Visão Geral",
        description: "Métricas financeiras e operacionais de alto nível",
        sections: {
            revenueTrajectory: "Trajetória de Receita",
            revenueSplit: "Divisão de Receita",
            topLawyers: "Principais Advogados",
            productDistribution: "Distribuição de Produtos"
        },
        stats: {
            customers: "Clientes",
            totalRevenue: "Receita Total",
            revenueSubtitle: "Receita total acumulada",
            pendingPayments: "Pagamentos Pendentes",
            pendingSubtitle: "Awaiting confirmation",
            activeSellers: "Vendedores Ativos",
            pendingPartners: "Parceiros Pendentes",
            partnersSubtitle: "Fila de aprovação"
        },
        charts: {
            monthlyRevenue: "Receita Mensal",
            growth: "{{percent}}% de crescimento",
            serviceDistribution: "Distribuição de Serviços",
            byVisaType: "Por tipo de visto",
            total: "Total",
            last6Months: "Últimos 6 meses",
            casesCount: "{{count}} casos"
        },
        recentActivity: {
            title: "Atividade Recente",
            paymentReceived: "Pagamento Recebido",
            newCustomer: "Novo Cliente",
            processUpdated: "Processo Atualizado",
            paymentPending: "Pagamento Pendente",
            hoursAgo: "{{count}} horas atrás",
            yesterday: "Ontem"
        },
        master: {
            title: "Visão Geral Master",
            description: "Métricas globais da plataforma para administração Master.",
            stats: {
                totalRevenue: "Receita Total",
                lawyersCount: "Número de Advogados",
                customersCount: "Número de Clientes",
                processesCount: "Total de Processos",
                zellePayments: "Pagamentos via Zelle",
                requestedPayments: "Solicitações de Pagamento"
            },
            recentActivity: "Atividade Recente"
        },
        admin_lawyer: {
            title: "Visão Geral",
            description: "Métricas e controle financeiro do seu escritório.",
            stats: {
                revenue: "Receita",
                fees: "Taxas",
                activeProcesses: "Processos ativos",
                totalProcesses: "Total de processos",
                finishedProcesses: "Processos finalizados",
                availableBalance: "Saldo disponível para saque",
                availableBalanceSubtitle: "Disponível após 14 dias",
                withdrawBtn: "Solicitar Saque"
            },
            modals: {
                withdrawal: {
                    title: "Solicitar Saque",
                    description: "Solicite o saque do seu saldo disponível. Os fundos serão enviados para o método de recebimento configurado.",
                    amountLabel: "Valor para Saque",
                    amountPlaceholder: "0.00",
                    methodLabel: "Método de Recebimento",
                    paymentLinkLabel: "Link de Pagamento Stripe (para este saque)",
                    paymentLinkPlaceholder: "https://buy.stripe.com/...",
                    paymentLinkHint: "Crie um link de pagamento no seu painel Stripe com o valor exato deste saque.",
                    zelleConfirmation: "Confirmação Zelle",
                    zelleRecipientHint: "O saque será enviado para:",
                    zelleNameNotSet: "Nome da conta não configurado",
                    zelleIdNotSet: "ID Zelle não configurado",
                    limitReached: "O valor excede o saldo disponível.",
                    confirmBtn: "Confirmar Solicitação",
                    success: "Solicitação de saque enviada!",
                    error: "Erro ao solicitar saque."
                }
            }
        }
    },
    cases: {
        title: "Casos",
        subtitle: "Gestão completa das solicitações dos clientes",
        refresh: "Atualizar",
        stats: {
            total: "Total de Casos",
            awaiting: "Aguardando Revisão",
            active: "Em Andamento",
            completed: "Concluídos",
        },
        filters: {
            searchPlaceholder: "Buscar por nome ou e-mail...",
            allProducts: "Filtro: Todos os Produtos",
            pendingActions: "Ações Pendentes",
            viewAll: "Ver Tudo",
        },
        table: {
            client: "Cliente",
            service: "Serviço",
            payment: "Pagamento",
            flowActions: "Fluxo / Ações",
            noResults: "Nenhum processo encontrado no momento.",
            noName: "Sem Nome",
            noEmail: "E-mail não atualizado",
        },
        statusLabel: {
            uscisApproved: "Aprovado pelo USCIS",
            uscisDenied: "Negado pelo USCIS",
            completed: "Concluído",
            awaitingReview: "Revisão e Assinatura",
        },
        actions: {
            approve: "Aprovar",
            approveUscis: "Aprovar (Resultado USCIS)",
            reject: "Rejeitar Etapa",
            rejectUscis: "Negar (Resultado USCIS)",
        },
        messages: {
            loadError: "Erro ao carregar processos.",
            approveSuccess: "Etapa aprovada para {name}!",
            approveFinalSuccess: "Processo Concluído (Aprovado)!",
            rejectSuccess: "Etapa rejeitada. O cliente precisará refazer.",
            rejectFinalSuccess: "Processo Concluído (Negado).",
            errorAction: "Erro ao realizar ação: ",
        }
    },
    processDetail: {
        steps: {
            completed: "Etapa Concluída",
            awaitingAction: "Aguardando sua ação",
            stepCounter: "Etapa {{current}} de {{total}}",
        },
        mrv: {
            title: "Taxa MRV e Acesso ao Consulado",
            loginLabel: "Login Consulado (E-mail)",
            loginPlaceholder: "E-mail da conta consular",
            passwordLabel: "Senha Consulado",
            passwordPlaceholder: "Senha da conta consular",
            voucherLabel: "Voucher da Taxa MRV",
            voucherSent: "Voucher Enviado",
            selectVoucher: "Selecionar PDF do Voucher",
            finishGeneration: "Finalizar Geração de Taxa",
            messages: {
                fillFields: "Preencha login, senha e envie o voucher.",
                uploadSuccess: "Voucher enviado com sucesso!",
            }
        },
        scheduling: {
            title: "Agendamento Final (CASV/Consulado)",
            upsellTitle: "Plano Upsell Adquirido",
            upsellAction: "Intervir de Acordo com o Plano",
            sameLocation: "Mesmo Local",
            differentLocations: "Locais Diferentes",
            casvData: "Dados do CASV",
            consulateData: "Dados do Consulado",
            casvLocationPlaceholder: "Local do CASV",
            consulateLocationPlaceholder: "Local do Consulado",
            informClient: "Informar Cliente",
            updateScheduling: "Atualizar Agendamento",
            messages: {
                fillCasv: "Preencha os dados do CASV.",
                fillConsulate: "Preencha os dados do Consulado.",
                updateSuccess: "Agendamento atualizado!",
                notifiedSuccess: "Cliente notificado do agendamento!",
            }
        },
        motion: {
            panelTitle: "Formular Proposta de Motion",
            clientInstructions: "Instruções do Cliente",
            clientReason: "Motivo Informado:",
            noReason: "Nenhuma descrição fornecida.",
            denialLetter: "Carta de Negativa / Docs",
            strategyLabel: "Estratégia / Proposta",
            strategyPlaceholder: "Descreva a estratégia técnica para o Motion...",
            amountLabel: "Valor do Serviço ($)",
            sendProposal: "Enviar Proposta ao Cliente",
            finalPackageTitle: "Enviar Pacote Final (Motion)",
            packageReady: "Documento de Motion Pronto",
            noPackage: "Nenhum pacote enviado ainda",
            selectPackage: "Selecionar PDF Final",
        },
        rfe: {
            panelTitle: "Formular Proposta de Resposta RFE",
            infoTitle: "Informações do RFE",
            clientDescription: "Descrição do Cliente:",
            officialLetter: "Carta Oficial do RFE",
            strategyLabel: "Estratégia de Resposta",
            strategyPlaceholder: "Descreva como o RFE será respondido...",
            amountLabel: "Valor da Consultoria RFE ($)",
            sendProposal: "Enviar Proposta RFE",
            historyTitle: "Histórico de RFE",
            cycle: "Ciclo",
            resultApproved: "Aprovado",
            resultNewRfe: "Novo RFE",
            resultRejected: "Rejeitado",
            amount: "Valor:",
            finalPackageLoading: "Enviando pacote final RFE...",
            finalPackageTitle: "Enviar Pacote Final (RFE)",
            finalPackageReady: "Pacote final RFE pronto",
            selectFinalPdf: "Selecionar PDF Final",
            provideToClient: "Disponibilizar ao Cliente",
        },
        credentials: {
            title: "Credenciais CEAC / ID da Aplicação",
            appId: "ID da Aplicação",
            motherName: "Nome da Mãe (Pergunta de Segurança)",
            birthYear: "Ano de Nascimento",
            sendBtn: "Enviar Credenciais ao Cliente",
        },
        notifications: {
            completed: "Processo Concluído",
            approved: "Etapa Aprovada",
            corrections: "Correções Necessárias",
        },
        officialForms: {
            title: "Formulários Oficiais",
            i539Form: "Formulário I-539",
            digitalDocDesc: "Documento preenchido digitalmente.",
            viewPdf: "Ver PDF",
            reject: "Rejeitar",
        },
        coverLetter: {
            title: "Análise: Cover Letter",
            finalLetter: "Carta Final Gerada",
            generateBtn: "Gerar Cover Letter",
        },
        finalForms: {
            g1145: "G-1145",
            g1450: "G-1450",
        },
        i20Sevis: {
            title: "Revisar I-20 e SEVIS",
            rejectBtn: "Rejeitar",
            approveBtn: "Aprovar I-20 / SEVIS",
            requestCorrection: "Solicitar Correção",
        },
        f1Documents: {
            title: "Análise Aplikei: Documento I-20",
            approveBtn: "Aprovar Documentos",
        },
        f1FinalDocs: {
            title: "Comprovantes do Estudante (DS-160 / SEVIS)",
            ds160Signed: "DS-160 Assinado",
            finalProof: "Comprovante Final",
            approveBtn: "Aprovar Revisão Final",
        },
        b1b2FinalDocs: {
            title: "Comprovantes Finais DS-160",
            ds160Signed: "DS-160 Assinado",
            ceacProof: "Comprovante CEAC",
            approveBtn: "Aprovar Documentação",
        },
        casv: {
            title: "Agendamento CASV — Consulado",
            selectedConsulate: "Consulado Selecionado",
            noConsulate: "Consulado não informado",
            preferredDate: "Data Preferencial Solicitada",
            noDate: "Nenhuma data informada ainda.",
            confirmBtn: "Confirmar Agendamento",
            requestAdjustment: "Solicitar Ajuste",
        },
        accountCreation: {
            title: "Criação de Conta no Site do Consulado",
            instruction: "Use os dados acima para criar a conta oficial no site do consulado. Uma vez criada, confirme abaixo para que o cliente valide o acesso.",
            confirmBtn: "Confirmar Conta Criada",
            fullName: "Nome Completo",
            email: "E-mail",
            phone: "Telefone",
            notInformed: "Não informado",
        },
        finalPackage: {
            title: "Pacote Final",
            mergeBtn: "Mesclar Todos os Documentos",
            reviewPdf: "Revisar PDF",
            approveBtn: "Aprovar Etapa",
        },
        purchases: {
            title: "Histórico de Compras",
            slotsPaid: "Slots Pagos",
            noPurchases: "Nenhuma compra registrada via JSONB.",
            dependents: "Dependentes",
        },
        logs: {
            title: "Log de Alterações",
            noLogs: "Nenhuma alteração registrada ainda.",
            status: {
                active: "Ativo",
                awaitingReview: "Aguardando Revisão",
                completed: "Concluído",
                rejected: "Rejeitado",
            },
            actor: {
                admin: "Admin",
                client: "Cliente",
            },
            actions: {
                approved: "✅ Etapa Aprovada",
                returned: "🔄 Retornado ao Cliente",
                inReview: "⏳ Marcado como Em Revisão",
                completed: "🎉 Processo Concluído",
                formSubmitted: "📤 Formulário Enviado / Avançou Etapa",
                sentForReview: "📨 Enviado para Revisão",
                internalChange: "🔧 Alteração Interna",
            },
            labels: {
                step: "Etapa",
                status: "Status",
            },
            messages: {
                aiCoverLetterSuccess: "Cover Letter gerada com sucesso pela IA!",
                aiCoverLetterLoading: "IA gerando cover letter...",
                fillBioAndStrategy: "Por favor, preencha a bio e a estratégia.",
                generateError: "Erro ao gerar: ",
                finalPackageGenerating: "Gerando pacote final...",
                finalPackageGenerated: "Pacote gerado!",
            }
        }
    },
    customers: {
        title: "Clientes",
        subtitle: "Gerencie os clientes e usuários do seu sistema",
        searchInput: "Buscar por nome, e-mail ou telefone...",
        emptyState: "Nenhum cliente encontrado no momento.",
        stats: {
            totalUsers: "Total de Usuários",
            customers: "Clientes",
            admins: "Admins",
            newUsers: "Novos (7 dias)"
        },
        table: {
            customerContact: "Cliente / Contato",
            role: "Função",
            purchasesSpent: "Compras / Gastos",
            admissionDate: "Data de Admissão",
            actions: "Ações",
            noName: "Sem Nome",
            productCount: "{{count}} produto",
            productsCount: "{{count}} produtos"
        }
    },
    notificationsCenter: {
        title: "Notificações",
        markAll: "Marcar tudo",
        emptyTitle: "Sem notificações",
        emptySubtitle: "Tudo em dia!",
        viewFullLog: "Ver log completo",
        filters: {
            all: "Todas",
            unread: "Não lidas",
            adminAction: "Admin",
            clientAction: "Cliente",
            system: "Sistema",
        },
        labels: {
            system: "Notificação",
            actionRequiredReview: "Ação necessária: revisar etapa",
            actionRequiredReviewMessage: "Um cliente finalizou uma etapa e está aguardando sua revisão.",
            clientCompletedStepMessage: "O cliente concluiu a etapa \"{{step}}\" de {{service}} e aguarda sua revisão.",
            clientCompletedGenericMessage: "O cliente concluiu uma etapa de {{service}} e aguarda sua revisão.",
            stepApproved: "Etapa aprovada",
            stepApprovedMessage: "Sua etapa foi aprovada e você pode seguir para a próxima.",
            changesRequired: "Ajustes necessários",
            changesRequiredMessage: "Foram solicitados ajustes. Revise os detalhes e envie novamente.",
            processCompleted: "Processo concluído",
            processCompletedMessage: "Seu processo foi concluído.",
            interviewScheduled: "Entrevista agendada",
            interviewScheduledMessage: "Sua entrevista foi agendada. Confira a data e local no processo.",
        },
    },
    payments: {
        title: "Gestão de Pagamentos",
        subtitle: "Fila de conferência manual de transferências Zelle e ativação de serviços.",
        tabs: {
            pending: "Verificação Zelle",
            officeRequests: "Solicitações de Saque",
            approved: "Pagamentos Aprovados"
        },
        searchPlaceholder: "Buscar por serviço...",
        table: {
            customer: "Cliente",
            serviceName: "Nome do Serviço",
            payment: "Pagamento",
            actions: "Ações",
            noClientName: "Cliente sem nome",
            method: "Método: {{method}}",
            viewProof: "Ver comprovante",
            statusSuffix: "Status: {{status}}",
            expected: "Esperado: {{amount}}",
            code: "Código: {{code}}",
            autoProcessing: "Processamento Automático",
            couponApplied: "CUPOM APLICADO"
        },
        services: {
            analiseCos: "Análise de Especialista (COS)",
            analiseEos: "Análise de Especialista (EOS)",
            motionCos: "Motion (COS)",
            motionEos: "Motion (EOS)",
            rfeSupport: "Suporte RFE",
            rfeEos: "Suporte RFE (EOS)",
            rfeCos: "Suporte RFE (COS)",
            recoveryEos: "Recuperação de Caso (EOS)",
            recoveryCos: "Recuperação de Caso (COS)",
            motionSupport: "Suporte de Motion",
            mentoriaBronze: "Mentoria Bronze",
            mentoriaGold: "Mentoria Gold"
        },
        modals: {
            detailsTitle: "Detalhes do Pagamento",
            rejectTitle: "Rejeitar pagamento",
            reasonLabel: "Motivo (opcional)",
            reasonPlaceholder: "Ex: Comprovante ilegível, valor incorreto...",
            proofTitle: "Comprovante — {{name}}",
            openOriginal: "Abrir Original"
        },
        messages: {
            approveSuccess: "{{name}} aprovado!",
            rejectSuccess: "Pagamento rejeitado.",
            approveError: "Erro ao aprovar.",
            rejectError: "Erro ao rejeitar.",
            rejectedByAdmin: "Rejeitado pelo administrador."
        }
    },
    products: {
        title: "Produtos e Preços",
        subtitle: "Ative ou desative produtos e edite preços. Alterações afetam as compras imediatamente.",
        stats: {
            totalProducts: "Total de Produtos",
            activeCount: "Ativos",
            inactiveCount: "Inativos",
            avgTicket: "Ticket Médio"
        },
        table: {
            serviceId: "ID do Serviço",
            name: "Nome",
            currency: "Moeda",
            price: "Preço",
            status: "Status",
            actions: "Ação",
            active: "Ativo",
            inactive: "Inativo",
            edit: "Editar",
            activate: "Ativar",
            deactivate: "Desativar",
            itemCount: "{{count}} item",
            itemsCount: "{{count}} itens",
            productName: "Nome",
            actionsHeader: "Ações"
        },
        categories: {
            main_visa: "Vistos Principais",
            dependent: "Dependentes",
            analysis: "Análises",
            mentoring: "Mentorias",
            consultancy: "Consultoria",
            other: "Outros"
        },
        messages: {
            invalidValue: "Insira um valor válido.",
            updateSuccess: "Preço de \"{{name}}\" atualizado.",
            updateError: "Erro ao salvar preço: {{error}}",
            statusActivated: "\"{{name}}\" ativado!",
            statusDeactivated: "\"{{name}}\" desativado!",
            statusError: "Erro ao alterar status do produto.",
            noPermission: "Sem permissão para alterar este produto. Verifique as políticas RLS."
        },
        footerHint: "Produtos desativados não aparecerão no fluxo de vendas para os clientes."
    },
    analysisPanel: {
        title: "Análise Técnica Especializada",
        subtitle: "Analise o caso do cliente e define os próximos passos.",
        clientExplanation: "Explicação do Cliente",
        clientDocuments: "Documentos Enviados",
        noDocuments: "Nenhum documento enviado.",
        internalNotes: "Notas Internas (Opcional)",
        internalNotesPlaceholder: "Anote detalhes técnicos sobre este caso...",
        finalMessage: "Mensagem para o Cliente",
        finalMessagePlaceholder: "Explique o resultado da análise ou solicite mais dados...",
        actions: {
            completeReview: "Concluir Análise",
            sendProposal: "Enviar Proposta",
            requestMoreInfo: "Solicitar Informações",
            uploadFinalDocs: "Enviar Documentos Finais"
        },
        status: {
            pending: "Pendente de Análise",
            reviewing: "Em Revisão",
            proposalSent: "Proposta Enviada",
            completed: "Concluída",
            rfeRequested: "RFE Solicitado",
            motionStarted: "Motion Iniciado"
        },
        labels: {
            caseComplexity: "Complexidade do Caso",
            low: "Baixa",
            medium: "Média",
            high: "Alta",
            estimatedHours: "Horas Estimadas",
            expertAssigned: "Especialista Designado"
        },
        messages: {
            successSave: "Análise salva com sucesso!",
            errorSave: "Erro ao salvar análise.",
            missingFields: "Preencha a mensagem final ou envie pelo menos um documento.",
            proposalSent: "Proposta enviada ao cliente!"
        }
    },
    coupons: {
        title: "Cupons de Desconto",
        subtitle: "Crie e gerencie cupons promocionais. Alterações afetam o checkout imediatamente.",
        createNew: "Criar Novo Cupom",
        stats: {
            total: "Total de Cupons",
            active: "Ativos",
            expired: "Expirados",
            totalUses: "Total de Usos"
        },
        form: {
            code: "Código do Cupom",
            codePlaceholder: "Ex: PROMO20",
            generateRandom: "Gerar",
            discountType: "Tipo de Desconto",
            percentage: "Porcentagem (%)",
            fixed: "Valor Fixo ($)",
            value: "Valor",
            valuePlaceholder: "Ex: 20",
            maxUses: "Limite de Uso",
            maxUsesPlaceholder: "Vazio = ilimitado",
            expiration: "Expiração",
            expirationOptions: {
                "1h": "1 hora",
                "6h": "6 hours",
                "12h": "12 hours",
                "24h": "24 hours",
                "48h": "48 hours",
                "7d": "7 dias",
                "30d": "30 dias",
                "custom": "Personalizado"
            },
            customDate: "Data de expiração",
            applicableSlugs: "Serviços aplicáveis",
            allServices: "Todos os serviços",
            minPurchase: "Compra mínima (USD)",
            minPurchasePlaceholder: "0.00",
            submit: "Criar Cupom",
            sellerHint: "Como vendedor, seus cupons se aplicam apenas a vistos principais."
        },
        table: {
            code: "Código",
            type: "Tipo",
            value: "Valor",
            uses: "Usos",
            expiresAt: "Expira em",
            status: "Status",
            actions: "Ações",
            copy: "Copiar",
            activate: "Ativar",
            deactivate: "Desativar",
            unlimited: "ilimitado",
            remaining: "{{remaining}} restantes de {{total}}",
            noResults: "Nenhum cupom criado ainda."
        },
        status: {
            active: "Ativo",
            expired: "Expirado",
            depleted: "Esgotado",
            inactive: "Inativo"
        },
        messages: {
            createSuccess: "Cupom \"{{code}}\" criado com sucesso!",
            createError: "Erro ao criar cupom: {{error}}",
            toggleSuccess: "Cupom {{code}} {{status}}.",
            toggleError: "Erro ao alterar status.",
            statusActivated: "ativado",
            statusDeactivated: "desativado",
            copied: "Código copiado!",
            invalidValue: "Insira um valor válido.",
            invalidCode: "Insira um código válido.",
            rulePercentageNotAllowed: "Desconto em porcentagem não é permitido pelo seu escritório.",
            ruleFixedNotAllowed: "Desconto fixo não é permitido pelo seu escritório.",
            ruleMaxPct: "Desconto máximo permitido: {{value}}%",
            ruleMaxFixed: "Desconto máximo permitido: US$ {{value}}",
            ruleMaxUses: "Limite máximo de usos por cupom: {{value}}"
        }
    },
    chats: {
        title: "Central de Mensagens",
        subtitle: "Atendimento direto e revisão técnica para clientes.",
        searchPlaceholder: "Buscar conversa...",
        emptyState: "Nenhuma conversa encontrada.",
        selectChat: "Selecione uma conversa",
        selectChatSubtitle: "Escolha um cliente na lista para iniciar o atendimento ou revisão técnica.",
        online: "Online",
        offline: "Offline",
        typeMessage: "Digite sua mensagem...",
        today: "Hoje",
        settings: {
            title: "Configurações do Chat",
            goToProcess: "Ir para o processo",
            reopen: "Reabrir conversa",
            close: "Fechar conversa",
            reopenedSuccess: "Chat reaberto.",
            closedSuccess: "Chat fechado.",
            errorToggle: "Erro ao alterar status do chat: "
        }
    },
    teams: {
        title: "Gestão de Equipe",
        subtitle: "Gerencie acessos e permissões dos membros do seu escritório",
        selectOffice: "Selecionar escritório",
        generateLinkBtn: "Adicionar colaborador",
        copySuccess: "Link de cadastro copiado!",
        roles: {
            vendedor: "Vendedor",
            gerente: "Gerente",
            seller: "Vendedor",
            manager: "Gerente",
            admin: "Admin",
        },
        pending: {
            title: "Solicitações pendentes",
            subtitle: "Novos membros aguardando aprovação",
            newBadge: "{{count}} NOVOS",
            table: {
                candidate: "Candidato",
                requestedRole: "Função solicitada",
                requestDate: "Data da solicitação",
                actions: "Ações",
            },
            approveBtn: "Aprovar",
            rejectBtn: "Rejeitar",
            rejectConfirm: "Remover este usuário permanentemente do sistema?",
        },
        managers: {
            title: "Gerentes",
            subtitle: "Acesso administrativo completo",
        },
        sellers: {
            title: "Vendedores",
            subtitle: "Equipe de vendas e prospecção",
        },
        table: {
            member: "Membro",
            changeRole: "Alterar função",
            joinDate: "Data de entrada",
            actions: "Ações",
            removeBtn: "Remover",
            noMembers: "Nenhum membro encontrado.",
            loading: "Carregando...",
            noName: "Sem nome",
        },
        modal: {
            title: "Link de Cadastro",
            description: "Envie este link para novos membros. Eles entrarão como <b>inativos</b> até você aprovar.",
            defineRole: "Definir função do novo membro",
            generateBtn: "Adicionar colaborador",
            linkTitle: "Link de cadastro — {{role}}",
            copyBtn: "Copiar para área de transferência",
            backBtn: "Voltar",
        },
    },
    lawyers: {
        title: "Advogados Admin",
        subtitle: "Gestão de desempenho e acompanhamento de comissões para advogados.",
        stats: {
            total: "Total de Advogados",
            active: "Advogados Ativos",
            pending: "Aguardando Ativação",
            recent: "Novos (30 dias)"
        },
        table: {
            lawyer: "Advogado",
            status: "Status",
            admission: "Data de Registro",
            actions: "Ações",
            active: "Ativo",
            inactive: "Inativo",
            details: "Ver Detalhes",
            noResults: "Nenhum advogado encontrado.",
            searchPlaceholder: "Buscar advogado por nome ou e-mail..."
        }
    },
    layout: {
        admin: {
            subtitle: "Operação Aplikei",
            roleLabel: "Escopo Administrativo",
            headerEyebrow: "Painel Admin",
            spotlightTitle: "Operação Ativa",
            spotlightDescription: "Ambiente administrativo para gestão diária de atendimento, financeiro e portfólio."
        },
        master: {
            subtitle: "Gestão Global",
            roleLabel: "Escopo Master",
            headerEyebrow: "Painel Master",
            spotlightTitle: "Operação Master",
            spotlightDescription: "Ambiente master para supervisão global de todas as operações e usuários."
        },
        seller: {
            subtitle: "Vendas Aplikei",
            roleLabel: "Escopo Vendedor",
            headerEyebrow: "Painel Vendedor",
            spotlightTitle: "Pipeline de Vendas",
            spotlightDescription: "Escopo focado em vendas, relacionamento, campanhas e atendimento comercial."
        },
        shared: {
            consoleTitle: "Console Aplikei"
        }
    },
    profile: {
        title: "Alterar Perfil",
        uploadBtn: "Enviar foto",
        xAxis: "Eixo X",
        yAxis: "Eixo Y",
        zoom: "Zoom",
        nameLabel: "Nome",
        namePlaceholder: "Seu nome",
        saveBtn: "Salvar",
        savingBtn: "Salvando...",
        cancelBtn: "Cancelar",
        changeProfile: "Alterar Perfil",
        logout: "Sair",
        lightMode: "Modo Claro",
        darkMode: "Modo Escuro",
        successUpdate: "Perfil atualizado com sucesso.",
        errorUpdate: "Erro ao atualizar perfil.",
        selectImageError: "Selecione um arquivo de imagem.",
        imageSizeError: "A imagem deve ter no máximo 5MB.",
        closeMenu: "Fechar menu",
        openMenu: "Abrir menu"
    },
    roles: {
        title: "Controle de Acesso",
        subtitle: "Gerencie permissões, funções e atribuições de escritório para a equipe de staff.",
        searchPlaceholder: "Buscar por e-mail...",
        searchBtn: "Buscar",
        stats: {
            totalRoles: "Tipos de Funções",
            activeUsers: "Usuários Ativos"
        },
        table: {
            user: "Usuário",
            currentRole: "Função Atual",
            status: "Status",
            role: "Função",
            office: "Escritório",
            actions: "Ações",
            loading: "Carregando usuários...",
            noResults: "Nenhum usuário encontrado.",
            active: "Ativo",
            inactive: "Inativo",
            noName: "Sem nome",
            noOffice: "Sem escritório"
        },
        messages: {
            loadError: "Erro ao carregar usuários da equipe.",
            notFound: "Nenhum usuário encontrado para este e-mail.",
            searchError: "Erro ao buscar usuário por e-mail.",
            roleSuccess: "Função atualizada com sucesso.",
            saveError: "Erro ao salvar alteração.",
            promoteError: "Admin Advogado não pode promover usuários para Admin Advogado.",
            officeNotFound: "Escritório não encontrado.",
            officeSuccess: "Escritório atribuído com sucesso.",
            officeNameError: "Já existe um escritório com este nome.",
            officeSaveError: "Erro ao salvar escritório.",
            unassignConfirm: "Remover atribuição do escritório \"{{office}}\" para {{user}}?",
            unassignSuccess: "Atribuição de escritório removida.",
            unassignError: "Erro ao remover escritório.",
            activated: "Usuário ativado.",
            deactivated: "Usuário desativado.",
            statusError: "Erro ao alterar status do usuário."
        }
    },
    paymentMethods: {
        title: "Métodos de Pagamento",
        subtitle: "Configure como seus clientes podem pagar pelos seus serviços.",
        aplikei: {
            title: "Receber via Aplikei",
            activeDesc: "Todos os pagamentos são processados pelas contas da Aplikei.",
            inactiveDesc: "Ative para usar as contas da Aplikei em vez das suas próprias.",
            activeSuccess: "Os pagamentos serão processados pela Aplikei.",
            inactiveSuccess: "Suas próprias contas estão ativas novamente.",
            saveError: "Erro ao salvar: "
        },
        stripe: {
            title: "Stripe",
            description: "Receba pagamentos via Cartão de Crédito e PIX.",
            enable: "Ativar Stripe",
            clientId: "Stripe Connect Client ID",
            clientIdHint: "Encontre em: Dashboard Stripe → Connect → Configurações → Client ID",
            redirectUri: "URI de Redirecionamento — adicione ao Stripe",
            redirectUriHint: "Dashboard Stripe → Connect → Configurações → URIs de Redirecionamento → Adicionar URI",
            connected: "Conta conectada",
            connectedDesc: "Os pagamentos serão direcionados para sua conta Stripe.",
            connectTitle: "Conecte sua conta Stripe",
            connectDesc: "Autorize o acesso para que os pagamentos de seus clientes sejam depositados diretamente em sua conta.",
            connectBtn: "Conectar com Stripe",
            disconnectBtn: "Desconectar",
            redirecting: "Redirecionando...",
            footerHint: "Ao conectar, você autoriza a Aplikei a processar pagamentos em sua conta via Stripe Connect.",
            messages: {
                connectSuccess: "Conta Stripe conectada com sucesso!",
                connectError: "Erro ao conectar Stripe: ",
                disconnectSuccess: "Conta Stripe desconectada.",
                disconnectError: "Erro ao desconectar: ",
                statusError: "Erro ao salvar status do Stripe.",
                missingClientId: "Informe o Stripe Connect Client ID antes de conectar.",
                initError: "Erro ao iniciar conexão: "
            }
        },
        zelle: {
            title: "Zelle",
            description: "Receba transferências diretas via Zelle.",
            enable: "Ativar Zelle",
            recipientName: "Nome do Destinatário",
            email: "E-mail Zelle",
            phone: "Telefone Zelle",
            instructions: "Instruções de Pagamento",
            instructionsPlaceholder: "Ex: Envie o pagamento via Zelle e envie o comprovante.",
            messages: {
                statusError: "Erro ao salvar status do Zelle.",
                missingFields: "O Zelle requer e-mail ou telefone quando ativo."
            }
        },
        parcelow: {
            title: "Parcelow",
            description: "Receba pagamentos parcelados de clientes no Brasil.",
            enable: "Ativar Parcelow",
            accountIdentifier: "Identificador da Conta Parcelow",
            checkoutLink: "Link de Checkout Público",
            instructions: "Instruções de Pagamento",
            instructionsPlaceholder: "Ex: Complete o pagamento via Parcelow e envie o comprovante.",
            messages: {
                statusError: "Erro ao salvar status do Parcelow.",
                missingFields: "O Parcelow requer identificador e link quando ativo."
            }
        },
        shared: {
            change: "Alterar",
            active: "Ativo",
            inactive: "Inativo",
            missingConfig: "Configuração incompleta"
        },
        saveSuccess: "Configuração salva!",
        saveError: "Erro ao salvar configuração.",
    },
    offices: {
        title: "Escritórios Parceiros",
        subtitle: "Gerencie e monitore o desempenho de todos os escritórios na plataforma.",
        searchPlaceholder: "Buscar escritório ou responsável...",
        emptyState: "Nenhum escritório encontrado.",
        table: {
            office: "Escritório",
            processes: "Processos",
            revenue: "Receita",
            balance: "Saldo / Pendente",
            plan: "Plano Ativo",
            actions: "Ações",
            noResponsible: "Sem responsável",
            totalRevenue: "Receita Total",
            pendingRequests: "{{count}} pendentes",
            active: "Ativo",
            inactive: "Inativo",
            noPlan: "Sem Plano"
        },
        tooltips: {
            viewDetails: "Ver Detalhes",
            visitWebsite: "Acessar Página do Escritório"
        },
        menu: {
            changePlan: "Alterar Plano",
            changeExpiration: "Alterar Expiração",
            expirePlan: "Expirar Plano"
        },
        modals: {
            manageSubscription: "Gerenciar Assinatura",
            officeDetails: "Detalhes do Escritório",
            selectedOffice: "Escritório Selecionado",
            changePlanTo: "Alterar Plano para",
            noPlan: "Sem Plano",
            changeExpiration: "Alterar Expiração",
            expirationHint: "O acesso será cortado automaticamente após esta data.",
            officeName: "Nome do Escritório",
            responsible: "Responsável",
            cnpj: "CNPJ",
            currentPlan: "Plano Atual",
            contactInfo: "Informações de Contato",
            socialMedia: "Redes Sociais",
            stats: {
                processes: "Processos",
                revenue: "Receita",
                balance: "Saldo",
                pending: "Pendente"
            },
            notInformed: "Não informado",
            noEmail: "Sem e-mail",
            noPhone: "Sem telefone",
            noAddress: "Sem endereço registrado",
            noWebsite: "Sem site"
        },
        messages: {
            loadError: "Erro ao carregar dados.",
            updateSuccess: "Assinatura e expiração atualizadas!",
            updateError: "Erro ao atualizar.",
            expireConfirm: "Tem certeza que deseja expirar o plano do escritório {{name}}?",
            expireSuccess: "Plano expirado com sucesso.",
            expireError: "Erro ao expirar plano."
        }
    },
    companyProfile: {
        title: "Perfil da Empresa",
        subtitle: "Gerencie informações básicas, contato e redes sociais do seu escritório.",
        sections: {
            general: {
                title: "Informações Gerais",
                description: "Dados principais de identificação do escritório.",
                companyName: "Nome da Empresa / Escritório",
                cnpj: "CNPJ",
                address: "Endereço Completo"
            },
            contact: {
                title: "Contato e Canais",
                description: "Como os clientes podem encontrar você.",
                email: "E-mail Corporativo",
                phone: "Telefone / WhatsApp",
                website: "Site"
            },
            social: {
                title: "Redes Sociais",
                description: "Links para seus perfis sociais.",
                instagram: "Instagram",
                linkedin: "LinkedIn",
                facebook: "Facebook"
            }
        },
        saveBtn: "Salvar Perfil da Empresa",
        savingBtn: "Salvando Alterações...",
        messages: {
            notFound: "Escritório não encontrado.",
            notFoundDescription: "Não conseguimos localizar o registro do seu escritório.",
            loadError: "Erro ao carregar dados da empresa.",
            saveSuccess: "Dados atualizados com sucesso!",
            saveError: "Erro ao salvar alterações."
        }
    },
    subscription: {
        title: "Minha Assinatura",
        subtitle: "Gerencie seu plano, faturas e recursos da plataforma",
        status: {
            active: "Plano Ativo",
            none: "Sem Assinatura",
            inactive: "Assinatura Inativa"
        },
        noPlan: "Sem Plano",
        nextBilling: "Próxima Renovação",
        nextCycle: "Próximo Ciclo",
        manageCard: "Gerenciar Cartão",
        billingHistory: "Histórico de Faturamento",
        paidOn: "Pago em {{date}}",
        upgrade: {
            title: "Upgrade de Plano",
            description: "Precisa de mais membros ou recursos corporativos? Descubra o plano Enterprise.",
            btn: "Ver Outros Planos"
        },
        security: {
            title: "Segurança Garantida",
            description: "Sua assinatura é processada de forma segura através do Stripe. Não armazenamos os dados do seu cartão em nossos servidores."
        },
        modals: {
            choosePlan: "Escolha seu novo plano",
            transitionHint: "Transição suave entre modelos de negócio",
            changeBtn: "Mudar para este plano",
            effectHint: "* A mudança entrará em vigor no próximo ciclo de faturamento",
            cancelTitle: "Cancelar Assinatura?",
            cancelDescription: "Você perderá o acesso aos recursos premium do escritório. Esta ação não pode ser desfeita automaticamente.",
            cancelConfirm: "Confirmar Cancelamento",
            cancelKeep: "Manter Plano",
            cancelBtn: "Cancelar Assinatura",
            expiration: "Expiração",
            cancelSuccess: "Assinatura cancelada com sucesso.",
            cancelError: "Falha ao cancelar assinatura."
        },
        onboarding: {
            eyebrow: "Torne-se um Escritório Parceiro",
            title: "Escolha o plano ideal para seu escritório",
            description: "Temos modelos flexíveis que se adaptam ao seu volume de casos e receita. Sem compromisso, cancele a qualquer momento.",
            btn: "Contratar este plano"
        },
        plans: {
            fixed: {
                name: "Plano Fixo",
                price: "$149",
                period: "por mês",
                description: "Ideal para escritórios com receita constante.",
                features: ["Recorrência fixa", "Sem surpresas", "Suporte VIP"]
            },
            percentage: {
                name: "Plano Escalonável",
                price: "5%",
                period: "da receita",
                description: "Pague apenas quando ganhar. Com taxas mínimas e máximas.",
                features: ["Taxa mínima de $49", "CAP máximo de $699", "Cresce com você"]
            },
            hybrid: {
                name: "Plano Híbrido",
                price: "$79 + 2%",
                period: "mensal",
                description: "O melhor dos dois mundos para alta performance.",
                features: ["Taxa fixa reduzida", "% competitivo", "Recursos ilimitados"]
            }
        },
        features: {
            unlimitedProcesses: "Casos Ilimitados",
            membersLimit: "Até 5 Membros na Equipe",
            prioritySupport: "Suporte Prioritário 24/7",
            customSalesPage: "Página de Vendas Customizada",
            advancedAi: "Integração com IA Avançada"
        }
    }
};

export default admin;
