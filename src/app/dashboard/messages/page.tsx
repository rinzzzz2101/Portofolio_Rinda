"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Trash2, Eye } from "lucide-react";
import { getMessages, deleteMessage, markMessageRead } from "@/actions/contacts";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";
import { LoadingSpinner } from "@/components/ui/loading";

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const res = await getMessages();
    if (res.success) setMessages(res.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Pesan?",
      message: "Apakah Anda yakin ingin menghapus pesan ini secara permanen?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger"
    });
    if (!isConfirmed) return;
    await deleteMessage(id);
    toast("Pesan berhasil dihapus.", "success");
    loadMessages();
  };

  const handleMarkRead = async (id: string) => {
    await markMessageRead(id);
    loadMessages();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Pesan Masuk</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Baca pesan dari pengunjung website Anda.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat pesan masuk..." />
      ) : messages.length === 0 ? (
        <Card className="panel">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Mail className="w-16 h-16 mb-4" style={{ color: 'var(--text-dim)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Belum ada Pesan</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pesan dari form Contact di Landing Page akan muncul di sini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card 
              key={msg.id} 
              className="panel shadow-sm hover:shadow-md transition-all"
              style={{
                borderLeftWidth: !msg.isRead ? '4px' : '1px',
                borderLeftColor: !msg.isRead ? 'var(--text-primary)' : 'var(--border-default)'
              }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{msg.name}</h4>
                      {!msg.isRead && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{msg.email}</p>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.message}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
                      {new Date(msg.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!msg.isRead && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkRead(msg.id)} className="p-2 hover:bg-zinc-200 dark:hover:bg-muted" style={{ color: 'var(--text-secondary)' }} title="Tandai sudah dibaca">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id)} className="p-2 hover:bg-red-500/10 text-red-500" title="Hapus pesan">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
