"use client";

import { Button } from "@/components/ui/button";
import { X, Sparkles, Users, Zap, TrendingUp, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanDemo: () => void;
}

export function AccessRequestModal({ isOpen, onClose, onPlanDemo }: AccessRequestModalProps) {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight">
              {t('accessModal.title')}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
              {t('accessModal.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Feature 1: Recruitment Strategies */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">
                {t('accessModal.features.recruitment.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('accessModal.features.recruitment.description')}
              </p>
            </div>

            {/* Feature 2: Persona Matching */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200/50">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">
                {t('accessModal.features.persona.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('accessModal.features.persona.description')}
              </p>
            </div>

            {/* Feature 3: ATS Integrations */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200/50">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">
                {t('accessModal.features.ats.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('accessModal.features.ats.description')}
              </p>
            </div>

            {/* Feature 4: Unlimited Optimizations */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-200/50">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">
                {t('accessModal.features.unlimited.title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('accessModal.features.unlimited.description')}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-base font-semibold text-slate-700">
              {t('accessModal.cta.question')}
            </p>
            <div className="space-y-3">
              <Button
                onClick={onPlanDemo}
                size="lg"
                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t('accessModal.cta.planDemo')}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-900"
              >
                {t('accessModal.cta.noThanks')}
              </Button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-slate-600">{t('accessModal.trust.noSpam')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">{t('accessModal.trust.freeTrial')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
