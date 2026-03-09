import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useCollaborations } from "@/hooks/useFirestore";
import { Handshake } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function CollaborationsSection() {
  const { collaborations, loading } = useCollaborations();

  if (loading || collaborations.length === 0) return null;

  return (
    <section className="py-24 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Partners</Badge>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Our Collaborations</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Trusted by creators, influencers, and companies shaping the future of learning.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collaborations.map((c, i) => (
            <motion.div
              key={c.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group relative rounded-2xl border border-border bg-card p-6 text-center transition-all duration-500 hover:border-accent/30 hover:shadow-glow hover:-translate-y-1"
            >
              <div className="relative mx-auto mb-4 h-20 w-20">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-border group-hover:border-accent/50 transition-colors duration-300"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                    <Handshake className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {c.badgeUrl && (
                  <img
                    src={c.badgeUrl}
                    alt={`${c.platformType} badge`}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-card object-cover"
                  />
                )}
              </div>
              <h3 className="font-display text-base font-semibold mb-1">{c.name}</h3>
              <Badge variant="secondary" className="text-[10px] mb-2">{c.platformType}</Badge>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
