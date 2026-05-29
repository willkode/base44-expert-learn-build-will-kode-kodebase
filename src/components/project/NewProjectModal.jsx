import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wand2, FileUp, ArrowRight } from "lucide-react";
import PrdImportDialog from "./PrdImportDialog";

export default function NewProjectModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [showPrd, setShowPrd] = useState(false);

  const startWizard = () => {
    onOpenChange(false);
    navigate("/projects/new");
  };

  const ChoiceCard = ({ icon: Icon, title, description, onClick }) => (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/50 hover:bg-card transition-all flex flex-col"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-sora font-semibold mb-1 flex items-center gap-1.5">
        {title}
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );

  return (
    <>
      <Dialog open={open && !showPrd} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-sora">Start a new project</DialogTitle>
            <DialogDescription>Choose how you'd like to begin.</DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <ChoiceCard
              icon={Wand2}
              title="Guided wizard"
              description="Answer a few questions and the AI architect plans the rest."
              onClick={startWizard}
            />
            <ChoiceCard
              icon={FileUp}
              title="Import a PRD"
              description="Upload a document and we'll pre-fill the wizard for you."
              onClick={() => setShowPrd(true)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <PrdImportDialog
        open={open && showPrd}
        onOpenChange={(v) => {
          if (!v) setShowPrd(false);
          onOpenChange(v);
        }}
        onBack={() => setShowPrd(false)}
      />
    </>
  );
}