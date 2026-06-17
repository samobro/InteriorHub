import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, MessageCircle, Search } from "lucide-react";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

type Engineer = {
  name: string;
  city: string;
  specialty: string;
  initials: string;
};

const stats: Stat[] = [
  { value: 50, suffix: "+", label: "مهندس معتمد" },
  { value: 200, suffix: "+", label: "مشروع منجز" },
  { value: 10, suffix: "+", label: "مدينة" },
];

const steps = [
  { title: "تصفح المهندسين", icon: Search, description: "ابحث بين نخبة من مهندسي الديكور المعتمدين في اليمن." },
  { title: "شاهد أعمالهم", icon: Eye, description: "اطّلع على المحافظ والمشاريع السابقة لاختيار الأسلوب الأنسب لك." },
  { title: "تواصل معهم", icon: MessageCircle, description: "ابدأ المحادثة واتفق على تفاصيل مشروعك بكل سهولة." },
];

const engineers: Engineer[] = [
  { name: "م. سارة الحمادي", city: "صنعاء", specialty: "تصميم سكني", initials: "سح" },
  { name: "م. أحمد اليافعي", city: "عدن", specialty: "تصميم تجاري", initials: "أي" },
  { name: "م. ليان الشامي", city: "تعز", specialty: "ديكور داخلي", initials: "لش" },
];

function CountUpStat({ value, suffix = "+", label }: Stat) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1200;
    const start = performance.now();
    let frameId = 0;

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

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
      className="rounded-2xl border bg-card p-6 text-center shadow-sm"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-3xl font-bold text-[var(--color-primary)] md:text-4xl">
        {suffix}{count}
      </div>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">{label}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-[var(--color-background)] text-foreground">
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.12),transparent_30%)]" />
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <motion.p
            className="mb-4 rounded-full border bg-card/80 px-4 py-2 text-sm font-medium text-[var(--color-primary)] shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0 }}
          >
            منصة يمنية للديكور الداخلي
          </motion.p>
          <motion.h1
            className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.16 }}
          >
            اكتشف أفضل مهندسي الديكور في اليمن
          </motion.h1>
          <motion.p
            className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.32 }}
          >
            منصة InteriorHub تربطك بأفضل المهندسين المعتمدين لتحويل مساحتك
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.48 }}
          >
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/engineers">تصفح المهندسين</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/register">سجّل كمهندس</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <CountUpStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">كيف تعمل المنصة؟</h2>
            <p className="mt-3 text-muted-foreground">ثلاث خطوات بسيطة للعثور على المهندس المناسب.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 44 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.12 }}
                >
                  <Card className="h-full border bg-card/80 shadow-sm backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-[var(--color-primary)]">
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">مهندسون مميزون</h2>
            <p className="mt-3 text-muted-foreground">نماذج من الخبرات المتاحة على InteriorHub.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {engineers.map((engineer, index) => (
              <motion.div
                key={engineer.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <Card className="h-full overflow-hidden border bg-card shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-[var(--color-primary)] ring-4 ring-background">
                      {engineer.initials}
                    </div>
                    <h3 className="text-xl font-semibold">{engineer.name}</h3>
                    <p className="mt-2 text-muted-foreground">{engineer.city}</p>
                    <p className="mt-3 inline-flex rounded-full bg-muted px-4 py-2 text-sm font-medium">
                      {engineer.specialty}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-5xl rounded-3xl bg-primary p-8 text-center text-primary-foreground shadow-xl md:p-12"
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">هل أنت مهندس ديكور؟</h2>
          <p className="mt-4 text-lg opacity-90">انضم إلى المنصة وابدأ تجربتك المجانية اليوم</p>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full px-8">
            <Link href="/register">سجّل الآن مجاناً</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
