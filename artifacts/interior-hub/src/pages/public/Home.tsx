import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Eye, MessageCircle, Search } from "lucide-react";
import { motion, useInView } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StatItem = {
  value: number;
  suffix: string;
  label: string;
};

type StepItem = {
  title: string;
  description: string;
  icon: typeof Search;
};

type Engineer = {
  name: string;
  city: string;
  specialty: string;
  initials: string;
};

const stats: StatItem[] = [
  { value: 50, suffix: "+", label: "مهندس معتمد" },
  { value: 200, suffix: "+", label: "مشروع منجز" },
  { value: 10, suffix: "+", label: "مدينة" },
];

const steps: StepItem[] = [
  {
    title: "تصفح المهندسين",
    description: "ابحث بين أفضل مهندسي الديكور المعتمدين في اليمن.",
    icon: Search,
  },
  {
    title: "شاهد أعمالهم",
    description: "استعرض نماذج المشاريع السابقة واختر الأسلوب الأنسب لك.",
    icon: Eye,
  },
  {
    title: "تواصل معهم",
    description: "ابدأ المحادثة واتفق على تفاصيل مشروعك بكل سهولة.",
    icon: MessageCircle,
  },
];

const featuredEngineers: Engineer[] = [
  {
    name: "م. ليان الحمادي",
    city: "صنعاء",
    specialty: "تصميم داخلي سكني",
    initials: "ل ح",
  },
  {
    name: "م. عمار اليافعي",
    city: "عدن",
    specialty: "ديكور تجاري ومكاتب",
    initials: "ع ي",
  },
  {
    name: "م. سارة الصبري",
    city: "تعز",
    specialty: "تصميم مطابخ ومساحات عائلية",
    initials: "س ص",
  },
];


function CountUpStat({ value, suffix, label }: StatItem) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    let frameId = 0;
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-3xl font-bold text-primary md:text-4xl">
        {suffix}
        {displayValue}
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground md:text-base">{label}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_32rem)]" />
        <motion.div
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.16 } }, hidden: {} }}
        >
          {[
            <span key="badge" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              InteriorHub لخبراء التصميم الداخلي في اليمن
            </span>,
            <h1 key="title" className="mt-8 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              اكتشف أفضل مهندسي الديكور في اليمن
            </h1>,
            <p key="subtext" className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              منصة InteriorHub تربطك بأفضل المهندسين المعتمدين لتحويل مساحتك
            </p>,
            <div key="actions" className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="min-w-40 text-base">
                <Link href="/engineers">تصفح المهندسين</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-40 text-base">
                <Link href="/register">سجّل كمهندس</Link>
              </Button>
            </div>,
          ].map((element, index) => (
            <motion.div
              key={index}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              {element}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <CountUpStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-primary">كيف تعمل المنصة؟</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">ثلاث خطوات للوصول إلى مصممك المثالي</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
                >
                  <Card className="h-full border-card-border bg-card/95">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-7" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/45 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-primary">مهندسون مميزون</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">ابدأ مع نخبة من الخبراء</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredEngineers.map((engineer, index) => (
              <motion.div
                key={engineer.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
              >
                <Card className="h-full overflow-hidden border-card-border bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-xl font-bold text-primary-foreground shadow-md">
                      {engineer.initials}
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{engineer.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{engineer.city}</p>
                    <p className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                      {engineer.specialty}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl rounded-3xl border border-primary/20 bg-primary px-6 py-12 text-center text-primary-foreground shadow-xl md:px-12"
          initial={{ opacity: 0, y: 56 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">هل أنت مهندس ديكور؟</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/85">
            انضم إلى المنصة وابدأ تجربتك المجانية اليوم
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 text-base">
            <Link href="/register">سجّل الآن مجاناً</Link>
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
