export interface PujanggaPlan {
    keputusan: string;
    alasan: string;
    perintah_sistem: string | null;
    catatan_internal: string;
}

export interface PujanggaProvider {
    id: string;
    name: string;
    berpikir(konteks: string, instruksi: string): Promise<PujanggaPlan>;
}
