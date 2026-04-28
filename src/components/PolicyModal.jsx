/**
 * ポリシーモーダルコンポーネント
 */

import React from 'react';
import { memo } from 'react'

const PolicyModalContent = ({ type, onClose }) => {
  const isPolicy = type === 'policy'
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content policy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {isPolicy ? (
          <>
            <h2>プライバシーポリシー</h2>
            <div className="policy-content">
              <section>
                <h3>1. 概要</h3>
                <p>
                  「子供スケジュール」（以下、「本サービス」）は、お客様の個人情報保護を最優先に考えています。
                  本プライバシーポリシーは、本サービスにおける個人情報の取扱いについて説明します。
                </p>
              </section>

              <section>
                <h3>2. 収集する情報</h3>
                <p>本サービスは以下の情報を収集する場合があります：</p>
                <ul>
                  <li>児童のプロフィール情報（名前、生年月日）</li>
                  <li>スケジュール・予定情報</li>
                  <li>お住まいの都道府県・市町村</li>
                  <li>デバイス情報（Device Type、ブラウザ種類）</li>
                </ul>
              </section>

              <section>
                <h3>3. 情報の使用目的</h3>
                <ul>
                  <li>本サービスの提供・改善</li>
                  <li>適切なスケジュール情報の生成</li>
                  <li>エラー対応・ユーザーサポート</li>
                  <li>セキュリティ向上</li>
                </ul>
              </section>

              <section>
                <h3>4. データ保存</h3>
                <p>
                  全データは Firebase Realtime Database で暗号化された状態で保存されます。
                  ユーザーが決定した まで、ローカルストレージおよび Firebase に保存されます。
                </p>
              </section>

              <section>
                <h3>5. 第三者への共有</h3>
                <p>
                  原則として、ユーザーの個人情報を第三者と共有することはありません。
                  ただし、法令の要求がある場合は例外となる可能性があります。
                </p>
              </section>

              <section>
                <h3>6. GDPR 対応</h3>
                <p>
                  EU の一般データ保護規則（GDPR）に準拠しています。
                  データの削除リクエストに応じます。
                </p>
              </section>

              <section>
                <h3>7. お問い合わせ</h3>
                <p>
                  個人情報に関するご質問・ご懸念がある場合は、
                  お気軽にお問い合わせください。
                </p>
              </section>

              <section>
                <h3>8. ポリシー変更</h3>
                <p>
                  本ポリシーは予告なく変更される場合があります。
                  変更があった場合は本ページで通知します。
                </p>
              </section>

              <p className="policy-updated">最終更新：2026年4月20日</p>
            </div>
          </>
        ) : (
          <>
            <h2>利用規約</h2>
            <div className="policy-content">
              <section>
                <h3>1. サービスの概要</h3>
                <p>
                  「子供スケジュール」は、児童の成長段階に合わせた
                  スケジュール・予定管理ツールです。
                </p>
              </section>

              <section>
                <h3>2. ご利用条件</h3>
                <p>本サービスをご利用いただく際の条件は以下の通りです：</p>
                <ul>
                  <li>本サービスは無料でご利用いただけます</li>
                  <li>個人的な範囲での利用を想定しています</li>
                  <li>商用利用・販売目的での利用は禁止します</li>
                  <li>不正なアクセス・改ざんは禁止します</li>
                </ul>
              </section>

              <section>
                <h3>3. ユーザーの責任</h3>
                <ul>
                  <li>入力データの正確性を保証してください</li>
                  <li>アカウント・ログイン情報の管理は自己責任でお願いします</li>
                  <li>パスワードなどの機密情報は第三者と共有しないでください</li>
                </ul>
              </section>

              <section>
                <h3>4. 免責事項</h3>
                <p>
                  本サービスは「そのままの状態」で提供されます。
                  以下に関して、運営者は一切の責任を負いません：
                </p>
                <ul>
                  <li>データの紛失・消失</li>
                  <li>サービスの中断・中止</li>
                  <li>使用による損失・損害</li>
                  <li>セキュリティトラブル（不正アクセス等）</li>
                </ul>
              </section>

              <section>
                <h3>5. サービスの変更・終了</h3>
                <p>
                  運営者は予告なくサービスの変更・終了をする場合があります。
                  その場合、事前の通知をいたします。
                </p>
              </section>

              <section>
                <h3>6. 禁止事項</h3>
                <ul>
                  <li>違法行為の助成</li>
                  <li>他ユーザーへの迷惑行為</li>
                  <li>システムへの攻撃・侵入試行</li>
                  <li>サービス内容の無断転載・転用</li>
                </ul>
              </section>

              <section>
                <h3>7. 準拠法</h3>
                <p>
                  本規約は日本法に準拠します。
                  紛争発生時は、日本の裁判所の管轄に服します。
                </p>
              </section>

              <section>
                <h3>8. お問い合わせ</h3>
                <p>
                  ご質問・ご報告については、
                  本ページ内のお問い合わせフォームからお願いします。
                </p>
              </section>

              <p className="policy-updated">最終更新：2026年4月20日</p>
            </div>
          </>
        )}

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

const PolicyModal = memo(PolicyModalContent);
export default PolicyModal;
