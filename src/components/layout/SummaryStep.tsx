import React from "react";
import type { DreamselfProfile } from "../../types";
import AvatarView from "../AvatarView";


interface SummaryStepProps {
  profile: DreamselfProfile;
  onEnterWorld: () => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({
  profile,
  onEnterWorld,
}) => {
  const { dreamName, traits, avatar } = profile;

  return (
    <section className="app-screen app-screen-summary">
      <div className="summary-card">
        <div className="summary-avatar">
            <AvatarView avatar={avatar} traits={traits} />
        </div>

        <div className="summary-details">
          <h2 className="summary-title">{dreamName}</h2>
          <p className="summary-archetype">
            {traits.primaryArchetype}
            {traits.secondaryArchetype
              ? ` / ${traits.secondaryArchetype}`
              : null}
          </p>

          {traits.temperamentTags?.length ? (
            <p className="summary-tags">
              Temperament: {traits.temperamentTags.join(" · ")}
            </p>
          ) : null}

          <div className="summary-actions">
            <button className="primary-button" onClick={onEnterWorld}>
              Walk the Ribbon
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
