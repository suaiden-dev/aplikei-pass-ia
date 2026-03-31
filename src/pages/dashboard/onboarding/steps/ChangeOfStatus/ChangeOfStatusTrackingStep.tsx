import React from "react";
import { StepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Input } from "@/presentation/components/atoms/input";
import { Truck, Clock, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/atoms/card";

export const ChangeOfStatusTrackingStep = ({
  register,
  lang,
  t,
}: StepProps) => {
  const trans = (t as any).changeOfStatus.tracking;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          {trans.title[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt" 
            ? "Informe o código de rastreio do seu envio e veja os próximos passos." 
            : "Enter your shipment tracking code and see the next steps."}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Tracking Input */}
        <Card className="border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {trans.trackingLabel[lang]}
            </CardTitle>
            <CardDescription>
              {lang === "pt" 
                ? "Insira o código de rastreamento do envelope enviado para a USCIS (Fedex, UPS, USPS, etc)." 
                : "Enter the tracking code for the envelope sent to USCIS (Fedex, UPS, USPS, etc)."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Input
                {...register("trackingCode" as any)}
                placeholder={trans.trackingPlaceholder[lang]}
                className="h-12 text-lg font-mono uppercase"
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                {lang === "pt" ? "Tempo de Resposta" : "Response Time"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                {trans.description[lang]}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                {lang === "pt" ? "Recebimento da Carta" : "Receiving the Letter"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                {trans.letterInfo[lang]}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support Action */}
        <Card className="border-amber-200 bg-amber-50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <MessageSquare className="h-4 w-4" />
              {lang === "pt" ? "Suporte USCIS" : "USCIS Support"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-800/90 leading-relaxed">
              {trans.supportInfo[lang]}
            </p>
            <a 
              href="https://www.uscis.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-900 underline underline-offset-4 hover:text-amber-950"
            >
              <ExternalLink className="h-4 w-4" />
              USCIS Official Website (Assistente EMA)
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
