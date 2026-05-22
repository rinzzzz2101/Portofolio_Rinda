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
        <h1 className="text-3xl font-bold tracking-tight">Pesan Masuk</h1>
        <p className="text-gray-400 mt-2">Baca pesan dari pengunjung website Anda.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat pesan masuk..." />
      ) : messages.length === 0 ? (
        <Card className="glass-card border-gray-800 text-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Mail className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum ada Pesan</h3>
            <p className="text-gray-400">Pesan dari form Contact di Landing Page akan muncul di sini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id} className={`glass-card border-gray-800 text-white ${!msg.isRead ? "border-l-4 border-l-purple-500" : ""}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg">{msg.name}</h4>
                    <p className="text-purple-400 text-sm">{msg.email}</p>
                    <p className="text-gray-300 mt-3">{msg.message}</p>
                    <p className="text-gray-500 text-xs mt-2">{new Date(msg.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
                  </div>
                  <div className="flex gap-2">
                    {!msg.isRead && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkRead(msg.id)} className="hover:bg-gray-800">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id)} className="hover:bg-red-500/10 text-red-400">
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
